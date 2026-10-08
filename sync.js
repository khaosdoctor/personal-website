import { readFile, writeFile, readdir, mkdir, copyFile, rm, stat } from 'fs/promises';
import { existsSync, readFileSync, watch } from 'fs';
import { join, basename, extname } from 'path';
import { execFileSync } from 'child_process';
import chalk from 'chalk';
import createDebug from 'debug';
import matter from 'gray-matter';
import { marked } from 'marked';
import sharp from 'sharp';

const argv = process.argv.slice(2);
const flag = name => argv.includes(`--${name}`);
// --name=value wins over the env var, so a one-off run needs no exported variable
const opt = (name, env, fallback = '') =>
  argv.find(a => a.startsWith(`--${name}=`))?.slice(name.length + 3).trim() || process.env[env]?.trim() || fallback;

// --debug turns on every sync namespace; DEBUG=sync:covers still narrows it to one
if (flag('debug')) createDebug.enable(process.env.DEBUG || 'sync:*');
const debug = {
  vault: createDebug('sync:vault'),
  covers: createDebug('sync:covers'),
  gear: createDebug('sync:gear'),
  bake: createDebug('sync:bake'),
};

// chalk already drops the escape codes on a non-TTY stream, on NO_COLOR and on TERM=dumb,
// so CI logs stay plain; the emoji prefixes are the fallback marker when the color is gone
const log = {
  step: msg => console.log(chalk.bold.cyan(`\n▶ ${msg}`)),
  info: msg => console.log(chalk.dim(`  · ${msg}`)),
  ok: msg => console.log(chalk.green(`  ✔ ${msg}`)),
  warn: msg => console.warn(chalk.yellow(`  ⚠ ${msg}`)),
  error: msg => console.error(chalk.red(`  ✖ ${msg}`)),
};

if (flag('help')) {
  console.log(`Usage: bun sync.js [options]

  --watch              rebuild when a vault note or data file changes
  --debug              verbose per-file logging (same as DEBUG=sync:*)
  --vault=<name>       vault folder name to match (env VAULT_NAME, default "default")
  --vault-dir=<path>   notes directory, skips vault lookup (env VAULT_DIR)
  --vault-assets=<path>  attachments directory (env VAULT_ASSETS)
  --timeout=<ms>       per-request fetch timeout (env FETCH_TIMEOUT_MS, default 15000)
  --help               this text`);
  process.exit(0);
}

// Obsidian has no CLI, but it registers every vault here, so the path can move between machines
const OBSIDIAN_CONFIG = process.platform === 'darwin'
  ? join(process.env.HOME, 'Library/Application Support/obsidian/obsidian.json')
  : join(process.env.APPDATA || join(process.env.HOME, '.config'), 'obsidian/obsidian.json');
const VAULT_NAME = opt('vault', 'VAULT_NAME', 'default');

// First registered vault whose folder name contains VAULT_NAME
function findVault() {
  if (!existsSync(OBSIDIAN_CONFIG)) {
    debug.vault('no Obsidian config at %s', OBSIDIAN_CONFIG);
    return '';
  }
  try {
    const { vaults = {} } = JSON.parse(readFileSync(OBSIDIAN_CONFIG, 'utf-8'));
    const paths = Object.values(vaults).map(v => v.path).filter(Boolean);
    debug.vault('registered vaults: %o', paths);
    const match = paths.find(p => basename(p).toLowerCase().includes(VAULT_NAME.toLowerCase()));
    debug.vault('matched "%s" -> %s', VAULT_NAME, match || 'nothing');
    return match || '';
  } catch (err) {
    debug.vault('unreadable Obsidian config: %s', err.message);
    return '';
  }
}

const VAULT = findVault();
const VAULT_DIR = opt('vault-dir', 'VAULT_DIR') || (VAULT && join(VAULT, 'notes'));
const VAULT_ASSETS = opt('vault-assets', 'VAULT_ASSETS') || (VAULT && join(VAULT, 'internal/assets'));
if (!VAULT_DIR) log.warn(`no vault matching "${VAULT_NAME}" in ${OBSIDIAN_CONFIG}, using only data/gear`);
const SITE = 'https://lsantos.dev';
const RSS_URL ='https://blog.lsantos.dev/en/rss.xml';
const GEAR_DIR = './gear';
const GEAR_IMG = './img/gear';
const DATA_DIR = './data';
const GEAR_DATA = './data/gear';
const STATUS_ORDER = { active: 0, inactive: 1, archived: 2 };
const IMG_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg']);

const STATE_COLORS = {
  'broken': 'tag-red', 'actively-used': 'tag-green', 'owned': 'tag-green',
  'previously-owned': 'tag-yellow', 'second-hand': 'tag-blue', 'not-actively-used': 'tag-orange',
};
// Shown on the gear detail page but left off the /uses list
const LIST_HIDDEN_STATES = new Set(['owned', 'actively-used']);
const ESC_MAP ={ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const ENTITY_MAP = { '&apos;': "'", '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"' };
const RE_ESC = /[&<>"]/g;
const RE_SLUG = /[^a-z0-9]+/g, RE_SLUG_TRIM = /^-|-$/g;
const RE_WIKILINK = /(!?)\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
const RE_UNRESOLVED_LI = /^[ \t]*[-*]\s*<!--unresolved:[\s\S]*?-->\s*$/gm;
const RE_UNRESOLVED_INLINE = /<!--unresolved:([\s\S]*?)-->/g;
const RE_RSS_ITEM = /<item>([\s\S]*?)<\/item>/g;
const RE_ENTITY = /&(?:apos|amp|lt|gt|quot);/g;
const RSS_RE = Object.fromEntries(['title', 'link', 'pubDate'].map(t =>
  [t, new RegExp(`<${t}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]>|<${t}>([^<]*)</${t}>`)]));

const esc = s => s.replace(RE_ESC, c => ESC_MAP[c]);
const slugify = s => s.toLowerCase().replace(RE_SLUG, '-').replace(RE_SLUG_TRIM, '');
const rssTag = (b, tag) => { const m = b.match(RSS_RE[tag]); return m?.[1] ?? m?.[2] ?? ''; };


const pendingImages = [];

function resolveWikilinks(content, slugs) {
  return content
    .replace(RE_WIKILINK, (_, bang, target, alias) => {
      if (bang && IMG_EXTS.has(extname(target).toLowerCase())) {
        const src = join(VAULT_ASSETS, target);
        if (existsSync(src)) {
          const dest = slugify(target.replace(extname(target), '')) + extname(target).toLowerCase();
          pendingImages.push({ src, dest });
          const webpDest = dest.replace(/\.[^.]+$/, '.webp');
          const alt = alias && !/^\d+$/.test(alias) ? alias : target;
          return `![${alt}](/img/gear/${webpDest})`;
        }
        return '';
      }
      const slug = slugify(target);
      if (slugs.has(slug)) return `<a href="/gear/${slug}.html">${alias || target}</a>`;
      return bang ? '' : `<!--unresolved:${alias || target}-->`;
    })
    .replace(RE_UNRESOLVED_LI, '')
    .replace(RE_UNRESOLVED_INLINE, '$1');
}

async function readMdFiles(dir, skip = []) {
  if (!existsSync(dir)) {
    log.warn(`${dir}: not found, skipped`);
    return [];
  }
  const out = [], unreadable = [];
  // Sorted because readdir order is filesystem-dependent, and an unsorted sitemap would flip
  // on every build that ran on a different machine than the last one
  const files = (await readdir(dir)).filter(f => f.endsWith('.md') && !skip.includes(f)).sort();
  log.info(`${dir}: ${files.length} markdown files`);
  for (const f of files) {
    try {
      const { data, content } = matter(await readFile(join(dir, f), 'utf-8'), { engines: {} });
      const rating = data.personalRating ?? data.rating;
      const category = data['x-personal-site-category'];
      if (rating == null || !category) continue;
      const name = basename(f, '.md'), slug = slugify(name);
      // gray-matter parses ISO timestamps into Date objects; an invalid or missing value leaves it blank
      const updatedAt = new Date(data.updatedAt ?? NaN);
      out.push({
        name, slug, rating, body: content, isVault: dir === VAULT_DIR,
        oneliner: data.oneliner || '', coverUrl: data.coverUrl || '',
        state: data.state || [], category,
        externalLink: data.externalLink || '',
        updated: isNaN(updatedAt) ? '' : updatedAt.toISOString().slice(0, 10),
        // "[[Canon EOS 6D Mark II]]" (or a list of links); unquoted YAML turns [[x]] into nested arrays, hence flat()
        parents: [data['x-personal-site-parent'] ?? []].flat(Infinity)
          .map(p => slugify(String(p).replace(/^\[\[|\]\]$/g, '').split('|')[0])),
      });
    } catch (err) {
      // Most of these are ordinary vault notes with loose YAML, not gear, so only --debug names them
      unreadable.push(f);
      debug.vault('%s: unreadable frontmatter (%s)', f, err.message);
    }
  }
  if (unreadable.length) log.warn(`${unreadable.length} files with unreadable frontmatter skipped (--debug to list them)`);
  log.ok(`${out.length} gear notes with a rating and a category`);
  return out;
}

const COVER_DIR = './img/gear/covers';
const FETCH_TIMEOUT_MS = Number(opt('timeout', 'FETCH_TIMEOUT_MS')) || 15000;

const fetchWithTimeout = url => fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });

async function optimizeImage(input, outputPath) {
  try {
    await sharp(input).resize({ width: 600, withoutEnlargement: true }).webp({ quality: 80 }).toFile(outputPath);
    return true;
  } catch { return false; }
}

async function fetchCover(url, slug) {
  const dest = join(COVER_DIR, `${slug}.webp`);
  if (existsSync(dest)) {
    debug.covers('%s: cached', slug);
    return `/img/gear/covers/${slug}.webp`;
  }
  try {
    debug.covers('%s: fetching %s', slug, url);
    const res = await fetchWithTimeout(url);
    if (!res.ok) {
      log.warn(`${slug}: cover HTTP ${res.status}, keeping remote URL`);
      return url;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    if (!await optimizeImage(buf, dest)) {
      log.warn(`${slug}: cover could not be converted, keeping remote URL`);
      return url;
    }
    debug.covers('%s: saved %d bytes source -> %s', slug, buf.length, dest);
    return `/img/gear/covers/${slug}.webp`;
  } catch (err) {
    log.warn(`${slug}: cover ${err.name === 'TimeoutError' ? `timed out after ${FETCH_TIMEOUT_MS}ms` : err.message}, keeping remote URL`);
    return url;
  }
}

function gearPage(n, body) {
  const tags = stateTags(n.state);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(n.name)} - Lucas Santos</title>
  <meta name="description" content="${esc(n.oneliner || `${n.name}, rated ${n.rating}/10 by Lucas Santos`)}">
  <link rel="canonical" href="${SITE}/gear/${n.slug}.html">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Lucas Santos">
  <meta property="og:title" content="${esc(n.name)} - Lucas Santos">
  <meta property="og:description" content="${esc(n.oneliner || `${n.name}, rated ${n.rating}/10 by Lucas Santos`)}">
  <meta property="og:url" content="${SITE}/gear/${n.slug}.html">
  <meta property="og:image" content="${SITE}/img/og.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="preload" href="/fonts/plex-mono-400.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">
  <link rel="manifest" href="/manifest.json">
  <meta name="theme-color" content="#f4efe0" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#131313" media="(prefers-color-scheme: dark)">
  <link rel="stylesheet" href="/css/style.css">
  <script src="/js/theme.js"></script>
  <script src="/js/components.js"></script>
</head>
<body>
  <div class="layout">
    <site-sidebar class="sidebar"></site-sidebar>
    <main class="content">
      <div class="content-inner">
        <a href="/uses" class="back-link">&lt; uses</a>
        ${n.coverUrl ? `<img src="${esc(n.coverUrl)}" alt="${esc(n.name)}" class="gear-cover">` : ''}
        <h1 class="gear-detail">${esc(n.name)}</h1>
        <p class="gear-meta"><span class="rating">${n.rating}/10</span> ${tags}${n.updated ? ` <span class="gear-updated">updated ${n.updated}</span>` : ''}</p>
        ${n.oneliner ? `<p class="oneliner">${esc(n.oneliner)}</p>` : ''}
        <div class="gear-body">${body}</div>
        <site-footer class="socials"></site-footer>
      </div>
    </main>
  </div>
</body>
</html>`;
}

async function syncPosts() {
  log.step('📡 Fetching blog RSS');
  const res = await fetchWithTimeout(RSS_URL);
  if (!res.ok) throw new Error(`RSS fetch failed: ${res.status}`);
  const xml = await res.text();
  const items = [...xml.matchAll(RE_RSS_ITEM)].map(([, b]) => {
    const d = rssTag(b, 'pubDate');
    return {
      title: rssTag(b, 'title').replace(RE_ENTITY, m => ENTITY_MAP[m]),
      link: rssTag(b, 'link'),
      date: d ? new Date(d).toISOString().split('T')[0] : '',
    };
  });
  log.ok(`${Math.min(items.length, 3)} posts fetched`);
  return items.slice(0, 3);
}

async function syncGear() {
  log.step('🎛  Syncing gear notes');
  for (const d of [GEAR_DIR, GEAR_IMG, COVER_DIR]) if (!existsSync(d)) await mkdir(d, { recursive: true });

  const vault = await readMdFiles(VAULT_DIR);
  const local = await readMdFiles(GEAR_DATA, ['gear.template.md']);
  const vaultSlugs = new Set(vault.map(n => n.slug));
  const notes = [...vault, ...local.filter(n => !vaultSlugs.has(n.slug))];
  const allSlugs = new Set(notes.map(n => n.slug));

  // Every page is rewritten below, so clear the old ones and a deleted note stops leaving its page
  // behind. Skipped when nothing was found, so a missing vault cannot wipe the published pages.
  if (notes.length) {
    const stale = (await readdir(GEAR_DIR)).filter(f => f.endsWith('.html') && !allSlugs.has(basename(f, '.html')));
    for (const f of stale) await rm(join(GEAR_DIR, f));
    if (stale.length) log.info(`${stale.length} pages removed for notes that no longer qualify`);
  }

  const missingCovers = notes.filter(n => n.coverUrl && !existsSync(join(COVER_DIR, `${n.slug}.webp`))).length;
  if (missingCovers) log.info(`downloading ${missingCovers} covers, ${FETCH_TIMEOUT_MS}ms timeout each`);

  let coverCount = 0;
  const index = await Promise.all(notes.map(async n => {
    if (n.coverUrl) {
      // Counted before the call, otherwise an already-cached cover looks like a fresh download
      const wasMissing = !existsSync(join(COVER_DIR, `${n.slug}.webp`));
      const localCover = await fetchCover(n.coverUrl, n.slug);
      if (wasMissing && localCover !== n.coverUrl) coverCount++;
      n.coverUrl = localCover;
    }
    const hasPage = n.body.trim().length > 0;
    if (hasPage) {
      // data/gear notes are verbatim copies of vault notes in CI, so they carry wikilinks too
      let html = await marked(resolveWikilinks(n.body, allSlugs));
      const namePattern = n.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      html = html.replace(new RegExp(`^\\s*<h1>${namePattern}</h1>\\s*`), '');
      await writeFile(join(GEAR_DIR, `${n.slug}.html`), gearPage(n, html));
      debug.gear('%s: page written, category=%s rating=%s state=%o', n.slug, n.category, n.rating, n.state);
    }
    if (!hasPage) debug.gear('%s: empty body, list row only', n.slug);
    return {
      name: n.name, slug: n.slug, oneliner: n.oneliner, rating: n.rating,
      state: n.state, category: n.category,
      coverUrl: n.coverUrl, externalLink: n.externalLink, hasPage, parents: n.parents,
    };
  }));
  if (coverCount) log.ok(`${coverCount} covers downloaded`);

  for (const img of pendingImages) {
    const destPath = join(GEAR_IMG, img.dest);
    const webpDest = destPath.replace(/\.[^.]+$/, '.webp');
    const ok = await optimizeImage(img.src, webpDest);
    if (!ok) await copyFile(img.src, destPath);
  }
  if (pendingImages.length) log.ok(`${pendingImages.length} images optimized`);
  pendingImages.length = 0;

  const lc = notes.filter(n => !n.isVault).length;
  log.ok(`${index.length} gear entries (${index.length - lc} vault, ${lc} manual)`);
  return index;
}

function postsHtml(posts) {
  return posts.map(p => `<li><span class="post-date">${p.date}</span><a href="${esc(p.link)}">${esc(p.title)}</a></li>`).join('\n');
}

const byRatingThenName = (a, b) => (b.rating || 0) - (a.rating || 0) || a.name.localeCompare(b.name);

const stateTags = states => states.map(s => `<span class="tag ${STATE_COLORS[s] || ''}">${esc(s)}</span>`).join(' ');

function gearRow(g, isChild) {
  const cells = `<span class="gear-name">${esc(g.name)}</span><span class="gear-desc">${esc(g.oneliner)}</span><span class="gear-states">${stateTags(g.state.filter(s => !LIST_HIDDEN_STATES.has(s)))}</span><span class="gear-rating">${g.rating}/10</span>`;
  const href = g.externalLink || (g.hasPage ? `/gear/${g.slug}.html` : '');
  const li = isChild ? '<li class="gear-child">' : '<li>';
  return href ? `${li}<a class="gear-link" href="${esc(href)}">${cells}</a></li>` : `${li}${cells}</li>`;
}

// Grouped by x-personal-site-category, alphabetical with "other" last; items by rating (desc), then name.
// Items with x-personal-site-parent render right below their parent (in the parent's category) instead of in their own
function gearHtml(items) {
  const bySlug = new Map(items.map(g => [g.slug, g]));
  const children = {};
  const grouped = {};
  for (const item of items) {
    const parents = item.parents.filter(p => bySlug.has(p) && p !== item.slug);
    if (item.parents.length && !parents.length) log.warn(`${item.name}: parent ${item.parents.join(', ')} not found, listed on its own`);
    if (!parents.length) {
      (grouped[item.category] ||= []).push(item);
      continue;
    }
    for (const p of parents) (children[p] ||= []).push(item);
  }

  // Depth-first so children of children also follow their parent; `seen` stops parent loops
  const rowsFor = (g, isChild, seen) => {
    if (seen.has(g.slug)) return [];
    seen.add(g.slug);
    const kids = (children[g.slug] || []).sort(byRatingThenName);
    return [gearRow(g, isChild), ...kids.flatMap(k => rowsFor(k, true, seen))];
  };

  const categories = Object.keys(grouped).sort((a, b) => a.localeCompare(b));

  const sections = [];
  for (const cat of categories) {
    const label = cat.split(/[\s-]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const rows = grouped[cat].sort(byRatingThenName).flatMap(g => rowsFor(g, false, new Set()));
    sections.push(`<div class="gear-category"><h2>${label}</h2><ul class="gear-list">\n${rows.join('\n')}\n</ul></div>`);
  }
  return sections.join('\n');
}

// Sorted active -> inactive -> archived; data-status drives label color and dimming in CSS
function projectsHtml(projects) {
  const sorted = [...projects].sort((a, b) => (STATUS_ORDER[a.status] ?? 3) - (STATUS_ORDER[b.status] ?? 3));
  return sorted.map(p => {
    const name = p.url ? `<a href="${esc(p.url)}" class="project-name">${esc(p.name)}</a>` : `<span class="project-name">${esc(p.name)}</span>`;
    return `<li class="project-item" data-status="${esc(p.status)}"><div class="project-header">${name}<span class="project-status" data-status="${esc(p.status)}">${esc(p.status)}</span></div><div class="project-desc">${esc(p.description)}</div></li>`;
  }).join('\n');
}

// Sorts every run of "- " lines by name, so a new friend can go anywhere in the list
// ponytail: one line per item, a wrapped item would get split apart
const sortLists = text => text.replace(/(?:^- .*(?:\n|$))+/gm, block =>
  block.trimEnd().split('\n').sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' })).join('\n') + '\n');

// Replaces whatever sits between <!-- bake:name --> and <!-- /bake:name --> in an HTML page
async function bake(file, blocks) {
  let html = await readFile(file, 'utf-8');
  for (const [name, content] of Object.entries(blocks)) {
    const re = new RegExp(`(<!-- bake:${name} -->)[\\s\\S]*?(<!-- /bake:${name} -->)`);
    if (!re.test(html)) {
      log.warn(`${file}: no bake:${name} marker, skipped`);
      continue;
    }
    html = html.replace(re, (_, open, close) => `${open}\n${content}\n${close}`);
    debug.bake('%s: replaced bake:%s (%d chars)', file, name, content.length);
  }
  await writeFile(file, html);
}

// A fresh CI checkout stamps every file with the checkout time, so mtime can't be trusted there
function lastCommitDate(file) {
  try {
    return execFileSync('git', ['log', '-1', '--format=%cs', '--', file], { encoding: 'utf-8' }).trim();
  } catch {
    return '';
  }
}

async function bakePages(posts, gear) {
  log.step('🥐 Baking pages');
  const md = async f => marked(await readFile(join(DATA_DIR, f), 'utf-8'));
  const nowUpdated = lastCommitDate(join(DATA_DIR, 'now.md')) || (await stat(join(DATA_DIR, 'now.md'))).mtime.toISOString().slice(0, 10);
  const projects = JSON.parse(await readFile(join(DATA_DIR, 'projects.json'), 'utf-8'));

  // No posts means the feed was unreachable; leaving the block out keeps whatever was baked last time
  await bake('index.html', { bio: await md('bio.md'), ...(posts && { posts: postsHtml(posts) }) });
  await bake('now.html', { now: await md('now.md'), 'now-date': nowUpdated });
  await bake('projects.html', { projects: projectsHtml(projects) });
  await bake('friends.html', { friends: marked(sortLists(await readFile(join(DATA_DIR, 'friends.md'), 'utf-8'))) });

  // No gear means no source was readable, not that the gear is gone. Rewriting /uses and the
  // sitemap here would publish an empty list, so both keep what they already have.
  if (!gear.length) {
    log.warn('no gear notes found, leaving /uses and the sitemap untouched');
    return;
  }

  await bake('uses.html', { gear: gearHtml(gear) });

  const urls = ['/', '/now', '/projects', '/uses', '/friends', ...gear.filter(g => g.hasPage).map(g => `/gear/${g.slug}.html`)];
  const sitemap = urls.map(u => `  <url><loc>${SITE}${u}</loc></url>`).join('\n');
  await writeFile('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemap}\n</urlset>\n`);
}

// A blog outage must not block a gear update, so the posts block keeps its previous content
const posts = await syncPosts().catch(err => {
  log.warn(`${err.name === 'TimeoutError' ? `RSS timed out after ${FETCH_TIMEOUT_MS}ms` : `RSS unavailable: ${err.message}`}, keeping the posts already on the page`);
  return null;
});
await bakePages(posts, await syncGear());
log.step('✅ Done');

// --watch: rebuild gear and pages when a vault note or data file changes (posts stay from the first fetch)
if (flag('watch')) {
  let timer;
  const rebuild = (_, file) => {
    if (!/\.(md|json)$/.test(file ?? '')) return;
    clearTimeout(timer);
    timer = setTimeout(async () => {
      try {
        await bakePages(posts, await syncGear());
        log.ok(`rebuilt after ${file}`);
      } catch (err) {
        log.error(`rebuild failed: ${err.message}`);
      }
    }, 500);
  };
  for (const dir of [VAULT_DIR, DATA_DIR].filter(existsSync)) watch(dir, { recursive: true }, rebuild);
  log.step('👀 Watching for changes');
}
