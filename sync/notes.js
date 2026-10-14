// Reads the gear and build notes from data/vault, writes one page per note into gear/ or builds/
// (with its cover and embedded images converted to WebP), and returns the notes for the lists and feeds
import { readFile, writeFile, readdir, mkdir, rm } from 'fs/promises';
import { existsSync } from 'fs';
import { join, basename, extname } from 'path';
import matter from 'gray-matter';
import { debug, log, flag, VAULT_DIR, VAULT_ASSETS, GEAR_DIR, BUILD_DIR, GEAR_IMG, FETCH_TIMEOUT_MS } from './options.js';
import { COVER_DIR, optimizeImage, fetchCover, pruneImages } from './images.js';
import { pagePath, notePage, pageMarkdown, slugify } from './render.js';

const IMG_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg']);
// ![[target|alias]] or [[target|alias]]: groups are the !, the target and the alias
const RE_WIKILINK = /(!?)\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
const RE_UNRESOLVED_LI = /^[ \t]*[-*]\s*<!--unresolved:[\s\S]*?-->\s*$/gm;
const RE_UNRESOLVED_INLINE = /<!--unresolved:([\s\S]*?)-->/g;
const RE_LEADING_H1 = /^\s*<h1>[\s\S]*?<\/h1>\s*/;
// <img src="/img/gear/x.webp" alt="..."> as marked writes it: groups are the file name and the quoted
// attributes after src (an alt text can hold a ">", so the attributes are matched as name="value" pairs)
const RE_GEAR_IMG = /<img src="\/img\/gear\/([^"/]+)"((?:\s+[a-z-]+="[^"]*")*)>/g;
// gray-matter runs a `---js` front matter block as code; with these engines unset, such a note is skipped as unreadable
const NO_CODE_ENGINES = { js: undefined, javascript: undefined };

// Turns wikilinks into links and image embeds into markdown images. hrefs maps a note slug to its
// page, so a wikilink to any published note becomes a link. Returns the markdown and the embedded
// images that still need converting into img/gear
function resolveWikilinks(content, hrefs) {
  const images = [];
  const markdown = content
    .replace(RE_WIKILINK, (_, bang, rawTarget, alias) => {
      // [[Note\|alias]] is how a wikilink escapes its pipe inside a markdown table
      const target = rawTarget.replace(/\\$/, '');
      if (bang && IMG_EXTS.has(extname(target).toLowerCase())) {
        // The export writes embeds relative to data/vault/assets
        const src = join(VAULT_ASSETS, target);
        if (!existsSync(src)) return '';
        // "photos/Desk Setup.JPG" -> "photos-desk-setup.webp"
        const dest = `${slugify(target.replace(extname(target), ''))}.webp`;
        images.push({ src, dest });
        // Obsidian sizes an embed with a trailing |400 or |400x300, which is not part of the caption
        const caption = (alias || '').replace(/(?:^|\|)\d+(?:x\d+)?$/, '');
        const alt = caption || basename(target, extname(target));
        return `![${alt}](/img/gear/${dest})`;
      }
      const slug = slugify(target);
      if (hrefs.has(slug)) return `<a href="${hrefs.get(slug)}">${alias || target}</a>`;
      return bang ? '' : `<!--unresolved:${alias || target}-->`;
    })
    .replace(RE_UNRESOLVED_LI, '')
    .replace(RE_UNRESOLVED_INLINE, '$1');
  return { markdown, images };
}

// Adds width/height (so the text below doesn't jump while the image loads) and lazy loading to each
// embedded image marked rendered as <img src="/img/gear/x.webp" alt="...">
function sizeImages(html, sizes) {
  return html.replace(RE_GEAR_IMG, (tag, file, rest) => {
    const size = sizes.get(file);
    if (!size) return tag;
    return `<img src="/img/gear/${file}"${rest} width="${size.width}" height="${size.height}" loading="lazy" decoding="async">`;
  });
}

// Every note in dir that the site publishes (export type `uses` or `build`, not private), as plain objects
async function readMdFiles(dir) {
  if (!existsSync(dir)) {
    log.warn(`${dir}: not found, skipped`);
    return [];
  }
  const out = [], unreadable = [];
  // Sorted because readdir order is filesystem-dependent, and an unsorted sitemap would change order
  // on every build that ran on a different machine than the last one
  const files = (await readdir(dir)).filter(f => f.endsWith('.md')).sort();
  log.info(`${dir}: ${files.length} markdown files`);
  for (const f of files) {
    try {
      const { data, content } = matter(await readFile(join(dir, f), 'utf-8'), { engines: NO_CODE_ENGINES });
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
        body: content,
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
      // A note with broken front matter is skipped; --debug names it
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

  const notes = await readMdFiles(VAULT_DIR);
  // A note with an empty body is only a row on /uses or /projects; only notes with a page get a cover,
  // a page, and wikilinks pointing at them
  const withPage = notes.filter(n => n.body.trim());
  for (const n of notes) if (!n.body.trim()) debug.gear('%s: empty body, list row only', n.slug);
  const hrefs = new Map(withPage.map(n => [n.slug, pagePath(n)]));

  // Every page is rewritten below, so clear the old ones: a deleted note, or one whose body was emptied,
  // stops leaving its page behind. Skipped when nothing was found, so a missing vault cannot wipe the published pages.
  if (notes.length) {
    for (const dir of [GEAR_DIR, BUILD_DIR]) {
      const stale = (await readdir(dir)).filter(f => f.endsWith('.html') && hrefs.get(basename(f, '.html')) !== `/${basename(dir)}/${f}`);
      for (const f of stale) await rm(join(dir, f));
      if (stale.length) log.info(`${dir}: ${stale.length} pages removed for notes that no longer qualify`);
    }
  }

  // Covers download in parallel; a cover that can't be fetched keeps its remote URL
  const withCover = withPage.filter(n => n.coverUrl);
  const missingCovers = withCover.filter(n => !existsSync(join(COVER_DIR, `${n.slug}.webp`))).length;
  if (missingCovers) log.info(`downloading ${missingCovers} covers, ${FETCH_TIMEOUT_MS}ms timeout each`);
  const covers = await Promise.all(withCover.map(async n => {
    const cover = await fetchCover(n.coverUrl, n.slug);
    n.coverUrl = cover.src;
    return cover.downloaded;
  }));
  const coverCount = covers.filter(Boolean).length;
  if (coverCount) log.ok(`${coverCount} covers downloaded`);

  // Wikilinks first, so every embedded image is known (once, even when two notes embed it) before conversion
  const embeds = new Map();
  for (const n of withPage) {
    const { markdown, images } = resolveWikilinks(n.body, hrefs);
    n.markdown = markdown;
    for (const img of images) embeds.set(img.dest, { ...img, note: n.name });
  }
  // file name -> { width, height } of each converted embed, so its <img> can reserve its space
  const sizes = new Map();
  for (const img of embeds.values()) {
    const size = await optimizeImage(img.src, join(GEAR_IMG, img.dest));
    if (size) {
      sizes.set(img.dest, size);
      continue;
    }
    // The page still links the .webp, so the image shows broken until the source file is fixed
    log.warn(`${img.note}: embed ${img.src} could not be converted, its image is missing on the page`);
  }
  if (sizes.size) log.ok(`${sizes.size} images optimized`);

  for (const n of withPage) {
    // The page template already shows the name as the page title, so a body that starts with its own h1 drops it
    const html = sizeImages(pageMarkdown(n.markdown).replace(RE_LEADING_H1, ''), sizes);
    // A `# heading` further down the note gives the page a second h1; worth fixing in the note, not worth failing the bake
    if (html.includes('<h1>')) log.warn(`${n.name}: the note has a # heading below its first line, so its page has two h1`);
    await writeFile(`.${pagePath(n)}`, notePage(n, html));
    debug.gear('%s: page written, category=%s rating=%s state=%o status=%s', n.slug, n.category, n.rating, n.state, n.status);
  }

  // Only the CI bake passes --prune-images, so a local run or --watch never deletes images.
  // Skipped when no notes were found, so an unreadable vault deletes nothing
  if (flag('prune-images') && notes.length) {
    const localCovers = withCover.filter(n => n.coverUrl.startsWith('/')).map(n => `${n.slug}.webp`);
    await pruneImages(new Set(embeds.keys()), new Set(localCovers));
  }

  // The lists, feeds and sitemap need the note without its markdown
  return notes.map(({ body, markdown, ...n }) => ({ ...n, hasPage: Boolean(body.trim()), href: pagePath(n) }));
}
