import { Marked, Renderer } from 'marked';
import { log, SITE } from './options.js';

// "Canon EOS 6D Mark II" -> "canon-eos-6d-mark-ii": file names, page URLs and heading ids
export const slugify = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// The # link after a heading, shared by markdown headings and the /uses category headings
const anchorHeading = (depth, id, html) =>
  `<h${depth} id="${id}">${html} <a class="anchor" href="#${id}" aria-label="Link to this section">#</a></h${depth}>`;

// Markdown for pages: every h2 and below gets an id from its text and a # link to itself, so sections
// can be linked, and every table sits in a box that scrolls sideways on phones. Feeds use the plain
// parser, a #fragment means nothing inside a feed reader.
// ponytail: two headings with the same text on one page share an id, the first one wins
const pageMarked = new Marked({
  renderer: {
    heading({ tokens, depth, text }) {
      const html = this.parser.parseInline(tokens);
      if (depth < 2) return `<h${depth}>${html}</h${depth}>\n`;
      return `${anchorHeading(depth, slugify(text), html)}\n`;
    },
    table(token) {
      return `<div class="table-scroll">${Renderer.prototype.table.call(this, token)}</div>\n`;
    },
  },
});
const feedMarked = new Marked();
export const pageMarkdown = md => pageMarked.parse(md);
export const feedMarkdown = md => feedMarked.parse(md);

const STATUS_ORDER = { active: 0, 'in-progress': 1, done: 2, inactive: 3, archived: 4 };
// Badge color per software `status` in data/projects.json; archived gets the plain grey tag
const SOFTWARE_TAG = { active: 'tag-green', 'in-progress': 'tag-yellow', done: 'tag-green', inactive: 'tag-red', archived: '' };

const STATE_COLORS = {
  'broken': 'tag-red', 'actively-used': 'tag-green', 'owned': 'tag-green',
  'previously-owned': 'tag-yellow', 'second-hand': 'tag-blue', 'not-actively-used': 'tag-orange',
};
// Shown on the gear detail page but left off the /uses list
const LIST_HIDDEN_STATES = new Set(['owned', 'actively-used']);
// Gear no longer around, its name is struck through on /uses
const GONE_STATES = new Set(['previously-owned', 'broken']);
// Build `status`, in the order of the builds list on /projects
const BUILD_STATUS = { 'in-progress': 'tag-yellow', planned: 'tag-blue', done: 'tag-green' };
const BUILD_ORDER = Object.keys(BUILD_STATUS);
const ESC_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const RE_ESC = /[&<>"]/g;

export const esc = s => s.replace(RE_ESC, c => ESC_MAP[c]);

// A note that is both gear and a build keeps its /gear page, so links to it from /uses don't break
export const pagePath = n => `/${n.isGear ? 'gear' : 'builds'}/${n.slug}.html`;
const statusTag = status => BUILD_STATUS[status] ? `<span class="tag ${BUILD_STATUS[status]}">${esc(status)}</span>` : '';

export function notePage(n, body) {
  const tags = [statusTag(n.status), stateTags(n.state)].filter(Boolean).join(' ');
  const desc = n.oneliner || (n.rating != null ? `${n.name}, rated ${n.rating}/10 by Lucas Santos` : `${n.name}, a build by Lucas Santos`);
  const back = n.isGear ? { href: '/uses', label: 'uses' } : { href: '/projects', label: 'projects' };
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(n.name)} - Lucas Santos</title>
  <meta name="description" content="${esc(desc)}">
  <link rel="canonical" href="${SITE}${pagePath(n)}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Lucas Santos">
  <meta property="og:title" content="${esc(n.name)} - Lucas Santos">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:url" content="${SITE}${pagePath(n)}">
  <meta property="og:image" content="${SITE}/img/og.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Lucas Santos, Staff Engineer">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="preload" href="/fonts/plex-mono-400.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/fonts/plex-mono-600.woff2" as="font" type="font/woff2" crossorigin>
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
  <a class="skip-link" href="#content">Skip to content</a>
  <div class="layout">
    <site-sidebar class="sidebar"></site-sidebar>
    <main class="content" id="content">
      <div class="content-inner">
        <a href="${back.href}" class="back-link">&lt; ${back.label}</a>
        ${n.coverUrl ? `<img src="${esc(n.coverUrl)}" alt="${esc(n.name)}" class="gear-cover">` : ''}
        <h1 class="section-label">${esc(n.name)}</h1>
        <p class="gear-meta">${n.rating != null ? `<span class="rating">${n.rating}/10</span> ` : ''}${tags}${n.updated ? ` <span class="gear-updated">updated ${n.updated}</span>` : ''}</p>
        ${n.oneliner ? `<p class="oneliner">${esc(n.oneliner)}</p>` : ''}
        <div class="gear-body">${body}</div>
        <site-footer class="socials"></site-footer>
      </div>
    </main>
  </div>
</body>
</html>`;
}

export function postsHtml(posts) {
  return posts.map(p => `<li><span class="post-date">${p.date}</span><a href="${esc(p.link)}">${esc(p.title)}</a></li>`).join('\n');
}

const byRatingThenName = (a, b) => (b.rating || 0) - (a.rating || 0) || a.name.localeCompare(b.name);

const stateTags = states => states.map(s => `<span class="tag ${STATE_COLORS[s] || ''}">${esc(s)}</span>`).join(' ');

function gearRow(g, isChild) {
  const tags = [g.diy && '<span class="tag">diy</span>', stateTags(g.state.filter(s => !LIST_HIDDEN_STATES.has(s)))].filter(Boolean).join(' ');
  const cells = `<span class="gear-name">${esc(g.name)}</span><span class="gear-desc">${esc(g.oneliner)}</span><span class="gear-states">${tags}</span><span class="gear-rating">${g.rating != null ? `${g.rating}/10` : ''}</span>`;
  const href = g.externalLink || (g.hasPage ? g.href : '');
  const classes = [isChild && 'gear-child', g.state.some(s => GONE_STATES.has(s)) && 'gone'].filter(Boolean).join(' ');
  const li = classes ? `<li class="${classes}">` : '<li>';
  return href ? `${li}<a class="gear-link" href="${esc(href)}">${cells}</a></li>` : `${li}${cells}</li>`;
}

// Grouped by x-personal-site-category, alphabetical with "other" last; items by rating (desc), then name.
// Items with x-personal-site-parent render right below their parent (in the parent's category) instead of in their own
export function gearHtml(items) {
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
    sections.push(`<div class="gear-category">${anchorHeading(2, slugify(label), label)}<ul class="gear-list">\n${rows.join('\n')}\n</ul></div>`);
  }
  return sections.join('\n');
}

// Sorted in-progress -> planned -> done, then by name; same markup as the software projects list
export function buildsHtml(builds) {
  const rank = b => BUILD_ORDER.indexOf(b.status) === -1 ? BUILD_ORDER.length : BUILD_ORDER.indexOf(b.status);
  const sorted = [...builds].sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));
  return sorted.map(b => {
    const name = b.hasPage ? `<a href="${esc(b.href)}" class="project-name">${esc(b.name)}</a>` : `<span class="project-name">${esc(b.name)}</span>`;
    return `<li class="project-item"><div class="project-header">${name}${statusTag(b.status)}</div><div class="project-desc">${esc(b.oneliner)}</div></li>`;
  }).join('\n');
}

// Sorted by STATUS_ORDER; data-status on the row lets the CSS dim inactive and archived projects
export function projectsHtml(projects) {
  const rank = p => STATUS_ORDER[p.status] ?? Object.keys(STATUS_ORDER).length;
  const sorted = [...projects].sort((a, b) => rank(a) - rank(b));
  return sorted.map(p => {
    const name = p.url ? `<a href="${esc(p.url)}" class="project-name">${esc(p.name)}</a>` : `<span class="project-name">${esc(p.name)}</span>`;
    const tagClass = ['tag', SOFTWARE_TAG[p.status]].filter(Boolean).join(' ');
    const badge = `<span class="${tagClass}">${esc(p.status)}</span>`;
    return `<li class="project-item" data-status="${esc(p.status)}"><div class="project-header">${name}${badge}</div><div class="project-desc">${esc(p.description)}</div></li>`;
  }).join('\n');
}

// Sorts every run of "- " lines by name, so a new friend can go anywhere in the list
// ponytail: one line per item, a wrapped item would get split apart
export const sortLists = text => text.replace(/(?:^- .*(?:\n|$))+/gm, block =>
  block.trimEnd().split('\n').sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' })).join('\n') + '\n');
