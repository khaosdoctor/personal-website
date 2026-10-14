import { readFile, writeFile, readdir, mkdir, copyFile, rm } from 'fs/promises';
import { existsSync } from 'fs';
import { join, basename, extname } from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import { debug, log, VAULT_DIR, VAULT_ASSETS, GEAR_DIR, BUILD_DIR, GEAR_IMG, VAULT_DATA, FETCH_TIMEOUT_MS } from './options.js';
import { COVER_DIR, optimizeImage, fetchCover } from './images.js';
import { pagePath, notePage } from './render.js';

const IMG_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg']);
const RE_SLUG = /[^a-z0-9]+/g, RE_SLUG_TRIM = /^-|-$/g;
const RE_WIKILINK = /(!?)\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
const RE_UNRESOLVED_LI = /^[ \t]*[-*]\s*<!--unresolved:[\s\S]*?-->\s*$/gm;
const RE_UNRESOLVED_INLINE = /<!--unresolved:([\s\S]*?)-->/g;
// Same stripping as internal/scripts/export-notes.mjs in second-brain; repeated here because a local run reads the raw vault
const RE_PRIVATE_CALLOUT = /^(?:>\s*)+\[!private\][^\n]*(?:\n>[^\n]*)*/gim;
const RE_COMMENT = /%%[\s\S]*?(?:%%|$)/g;

const slugify = s => s.toLowerCase().replace(RE_SLUG, '-').replace(RE_SLUG_TRIM, '');

const pendingImages = [];

// hrefs maps a note slug to its page, so a wikilink to any published note becomes a link
function resolveWikilinks(content, hrefs) {
  return content
    .replace(RE_WIKILINK, (_, bang, rawTarget, alias) => {
      // [[Note\|alias]] is how a wikilink escapes its pipe inside a markdown table
      const target = rawTarget.replace(/\\$/, '');
      if (bang && IMG_EXTS.has(extname(target).toLowerCase())) {
        // The raw vault embeds journal photos by full path, the export already made it relative to assets
        const rel = target.replace(/^internal\/assets\//, '');
        const src = join(VAULT_ASSETS, rel);
        if (existsSync(src)) {
          const dest = slugify(rel.replace(extname(rel), '')) + extname(rel).toLowerCase();
          pendingImages.push({ src, dest });
          const webpDest = dest.replace(/\.[^.]+$/, '.webp');
          // Obsidian sizes an embed with a trailing |400 or |400x300, which is not part of the caption
          const caption = (alias || '').replace(/(?:^|\|)\d+(?:x\d+)?$/, '');
          const alt = caption || basename(rel, extname(rel));
          return `![${alt}](/img/gear/${webpDest})`;
        }
        return '';
      }
      const slug = slugify(target);
      if (hrefs.has(slug)) return `<a href="${hrefs.get(slug)}">${alias || target}</a>`;
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
      if (data.private === true || data.private === 'true') continue;
      // `uses`, `build` or a list of both; it decides which site sections show the note
      const types = [data['x-personal-site-export-type'] ?? []].flat().map(String);
      const category = data['x-personal-site-category'];
      const isGear = types.includes('uses') && Boolean(category);
      const isBuild = types.includes('build');
      if (!isGear && !isBuild) continue;
      const name = basename(f, '.md'), slug = slugify(name);
      // gray-matter parses ISO timestamps into Date objects; an invalid or missing value leaves it blank
      const updatedAt = new Date(data.updatedAt ?? NaN);
      out.push({
        // Build notes say `built`, the site calls it `done` like the finished software
        name, slug, rating: data.personalRating ?? data.rating, isGear, isBuild, status: data.status === 'built' ? 'done' : data.status || '',
        // The note's own `type` list (overdrive, diy, ...); only diy shows up, as a tag on /uses
        diy: [data.type ?? []].flat().map(String).includes('diy'),
        body: content.replace(RE_PRIVATE_CALLOUT, '').replace(RE_COMMENT, ''), isVault: dir === VAULT_DIR,
        oneliner: data.oneliner || '', coverUrl: data.coverUrl || '',
        state: data.state || [], category,
        externalLink: data.externalLink || '',
        updated: isNaN(updatedAt) ? '' : updatedAt.toISOString().slice(0, 10),
        changedAt: data.updatedAt ?? data.createdAt ?? '',
        // "[[Canon EOS 6D Mark II]]" (or a list of links); unquoted YAML turns [[x]] into nested arrays, hence flat()
        parents: [data['x-personal-site-parent'] ?? []].flat(Infinity)
          .map(p => slugify(String(p).replace(/^\[\[|\]\]$/g, '').split('|')[0])),
      });
    } catch (err) {
      // Most of these are ordinary vault notes with loose YAML, not site notes, so only --debug names them
      unreadable.push(f);
      debug.vault('%s: unreadable frontmatter (%s)', f, err.message);
    }
  }
  if (unreadable.length) log.warn(`${unreadable.length} files with unreadable frontmatter skipped (--debug to list them)`);
  log.ok(`${out.filter(n => n.isGear).length} gear notes, ${out.filter(n => n.isBuild).length} builds`);
  return out;
}

export async function syncNotes() {
  log.step('🎛  Syncing gear and build notes');
  for (const d of [GEAR_DIR, BUILD_DIR, GEAR_IMG, COVER_DIR]) if (!existsSync(d)) await mkdir(d, { recursive: true });

  const vault = await readMdFiles(VAULT_DIR);
  const local = await readMdFiles(VAULT_DATA,['gear.template.md']);
  const vaultSlugs = new Set(vault.map(n => n.slug));
  const notes = [...vault, ...local.filter(n => !vaultSlugs.has(n.slug))];
  const hrefs = new Map(notes.map(n => [n.slug, pagePath(n)]));

  // Every page is rewritten below, so clear the old ones and a deleted note stops leaving its page
  // behind. Skipped when nothing was found, so a missing vault cannot wipe the published pages.
  if (notes.length) {
    for (const dir of [GEAR_DIR, BUILD_DIR]) {
      const stale = (await readdir(dir)).filter(f => f.endsWith('.html') && hrefs.get(basename(f, '.html')) !== `/${basename(dir)}/${f}`);
      for (const f of stale) await rm(join(dir, f));
      if (stale.length) log.info(`${dir}: ${stale.length} pages removed for notes that no longer qualify`);
    }
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
      // data/vault notes are vault notes exported in CI (private blocks stripped), so they carry wikilinks too
      let html = await marked(resolveWikilinks(n.body, hrefs));
      const namePattern = n.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      html = html.replace(new RegExp(`^\\s*<h1>${namePattern}</h1>\\s*`), '');
      await writeFile(`.${pagePath(n)}`, notePage(n, html));
      debug.gear('%s: page written, category=%s rating=%s state=%o status=%s', n.slug, n.category, n.rating, n.state, n.status);
    }
    if (!hasPage) debug.gear('%s: empty body, list row only', n.slug);
    return {
      name: n.name, slug: n.slug, oneliner: n.oneliner, rating: n.rating,
      state: n.state, category: n.category, status: n.status, diy: n.diy, isGear: n.isGear, isBuild: n.isBuild,
      coverUrl: n.coverUrl, externalLink: n.externalLink, hasPage, href: pagePath(n), parents: n.parents,
      changedAt: n.changedAt,
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
  log.ok(`${index.length} notes (${index.length - lc} vault, ${lc} manual)`);
  return index;
}
