import { readFile, writeFile, readdir, mkdir, copyFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join, basename, extname } from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import sharp from 'sharp';

const VAULT_DIR = process.env.VAULT_DIR || join(process.env.HOME, 'Documents/Obsidian/Vaults/Default/notes');
const VAULT_ASSETS = process.env.VAULT_ASSETS || join(process.env.HOME, 'Documents/Obsidian/Vaults/Default/internal/assets');
const RSS_URL = 'https://blog.lsantos.dev/en/rss.xml';
const GEAR_DIR = './gear';
const GEAR_IMG = './img/gear';
const DATA_DIR = './data';
const GEAR_DATA = './data/gear';
const GEAR_JSON = GEAR_DATA + '/gear.json';
const IMG_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg']);
const FAVICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='4' fill='%23000'/%3E%3Ctext x='4' y='22' font-family='monospace' font-size='18' fill='%23d6d2c9'%3E%3E_%3C/text%3E%3C/svg%3E";

const STATE_COLORS = {
  'broken': 'tag-red', 'actively-used': 'tag-green', 'owned': 'tag-green',
  'previously-owned': 'tag-yellow', 'second-hand': 'tag-blue', 'not-activelly-used': 'tag-orange',
};
const ESC_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
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

function inferCategory(tags) {
  if (!Array.isArray(tags)) return 'other';
  for (const t of tags) {
    if (t.includes('music')) return 'music';
    if (t.includes('electronics')) return 'electronics';
    if (t.includes('computer') || t.includes('tech')) return 'tech';
  }
  return 'other';
}

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
  if (!existsSync(dir)) return [];
  const out = [];
  for (const f of (await readdir(dir)).filter(f => f.endsWith('.md') && !skip.includes(f))) {
    try {
      const { data, content } = matter(await readFile(join(dir, f), 'utf-8'), { engines: {} });
      const rating = data.personalRating ?? data.rating;
      if (rating == null) continue;
      const name = basename(f, '.md'), slug = slugify(name);
      out.push({
        name, slug, rating, body: content, isVault: dir === VAULT_DIR,
        oneliner: data.oneliner || '', coverUrl: data.coverUrl || '',
        state: data.state || [], category: data.category || inferCategory(data.tags),
        externalLink: data.externalLink || '',
      });
    } catch { continue; }
  }
  return out;
}

const COVER_DIR = './img/gear/covers';

async function optimizeImage(input, outputPath) {
  try {
    await sharp(input).resize({ width: 600, withoutEnlargement: true }).webp({ quality: 80 }).toFile(outputPath);
    return true;
  } catch { return false; }
}

async function fetchCover(url, slug) {
  const dest = join(COVER_DIR, `${slug}.webp`);
  if (existsSync(dest)) return `/img/gear/covers/${slug}.webp`;
  try {
    const res = await fetch(url);
    if (!res.ok) return url;
    const buf = Buffer.from(await res.arrayBuffer());
    await optimizeImage(buf, dest);
    return `/img/gear/covers/${slug}.webp`;
  } catch { return url; }
}

function gearPage(n, body) {
  const tags = n.state.map(s => `<span class="tag ${STATE_COLORS[s] || ''}">${s}</span>`).join(' ');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(n.name)} - Lucas Santos</title>
  <link rel="icon" type="image/svg+xml" href="${FAVICON}">
  <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">
  <link rel="manifest" href="/manifest.json">
  <meta name="theme-color" content="#f4efe0" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)">
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
        <p class="gear-meta"><span class="rating">${n.rating}/10</span> ${tags}</p>
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
  console.log('Fetching RSS...');
  const res = await fetch(RSS_URL);
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
  await writeFile(join(DATA_DIR, 'posts.json'), JSON.stringify(items.slice(0, 3), null, 2));
  console.log(`  ${Math.min(items.length, 3)} posts saved`);
}

async function syncGear() {
  console.log('Syncing gear notes...');
  for (const d of [GEAR_DIR, GEAR_DATA, GEAR_IMG, COVER_DIR]) if (!existsSync(d)) await mkdir(d, { recursive: true });

  const vault = await readMdFiles(VAULT_DIR);
  const local = await readMdFiles(GEAR_DATA, ['gear.template.md']);
  const vaultSlugs = new Set(vault.map(n => n.slug));
  const notes = [...vault, ...local.filter(n => !vaultSlugs.has(n.slug))];
  const allSlugs = new Set(notes.map(n => n.slug));

  let coverCount = 0;
  const index = await Promise.all(notes.map(async n => {
    if (n.coverUrl) {
      const localCover = await fetchCover(n.coverUrl, n.slug);
      if (localCover !== n.coverUrl) coverCount++;
      n.coverUrl = localCover;
    }
    const hasPage = n.body.trim().length > 0;
    if (hasPage) {
      let html = await marked(n.isVault ? resolveWikilinks(n.body, allSlugs) : n.body);
      const namePattern = n.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      html = html.replace(new RegExp(`^\\s*<h1>${namePattern}</h1>\\s*`), '');
      await writeFile(join(GEAR_DIR, `${n.slug}.html`), gearPage(n, html));
    }
    return {
      name: n.name, slug: n.slug, oneliner: n.oneliner, rating: n.rating,
      state: n.state, category: n.category,
      coverUrl: n.coverUrl, externalLink: n.externalLink, hasPage,
    };
  }));
  if (coverCount) console.log(`  ${coverCount} covers downloaded`);

  for (const img of pendingImages) {
    const destPath = join(GEAR_IMG, img.dest);
    const webpDest = destPath.replace(/\.[^.]+$/, '.webp');
    const ok = await optimizeImage(img.src, webpDest);
    if (!ok) await copyFile(img.src, destPath);
  }
  if (pendingImages.length) console.log(`  ${pendingImages.length} images optimized`);
  pendingImages.length = 0;

  await writeFile(GEAR_JSON, JSON.stringify(index, null, 2));
  const lc = notes.filter(n => !n.isVault).length;
  console.log(`  ${index.length} gear entries (${index.length - lc} vault, ${lc} manual)`);
}

if (!existsSync(DATA_DIR)) await mkdir(DATA_DIR, { recursive: true });
await syncPosts();
await syncGear();
console.log('Done.');
