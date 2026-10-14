// The site's own RSS feeds (now.xml, uses.xml, projects.xml and feed.xml with all three), built from
// the git history of the data files and the notes' dates; blog posts keep the blog's own feed
import { writeFile } from 'fs/promises';
// posix: git tree paths need forward slashes on every OS
import { posix } from 'path';
import { execFileSync } from 'child_process';
import { log, SITE, RSS_URL, DATA_DIR } from './options.js';
import { esc, feedMarkdown } from './render.js';

// git paths, so no leading ./ (git log accepts it, but `git show <hash>:./x` does not)
const NOW_FILE = posix.join(DATA_DIR, 'now.md');
const PROJECTS_FILE = posix.join(DATA_DIR, 'projects.json');
// ponytail: latest 20 items per feed, a new subscriber doesn't need the whole history
const MAX_ITEMS = 20;

// "]]>" would end the CDATA early, so it is split across two sections
const cdata = s => `<![CDATA[${s.replaceAll(']]>', ']]]]><![CDATA[>')}]]>`;
// An old version of projects.json that doesn't parse counts as an empty list
const parseJson = s => { try { return JSON.parse(s); } catch { return []; } };
// Runs git and returns its output, or '' when git or the history is missing
const git = args => { try { return execFileSync('git', args, { encoding: 'utf-8' }); } catch { return ''; } };
// Oldest first as [hash, ISO date]; empty when there is no git or no history
const commitsOf = file => git(['log', '--reverse', '--format=%H %cI', '--', file]).split('\n').filter(Boolean).map(l => l.split(' '));
const showAt = (hash, file) => git(['show', `${hash}:${file}`]);
// "2026-10-12" of the last commit that touched the file; empty without git
export const lastCommitDate = file => git(['log', '-1', '--format=%cs', '--', file]).trim();

// One item per commit that changed what data/now.md says, with the page as it was then
function nowItems() {
  const versions = commitsOf(NOW_FILE).map(([hash, date]) => ({ hash, date, md: showAt(hash, NOW_FILE) }));
  return versions.filter((v, i) => v.md && v.md !== versions[i - 1]?.md).map(v => ({
    title: `Now: updated ${v.date.slice(0, 10)}`, link: `${SITE}/now`, guid: `now:${v.hash}`, date: v.date, html: feedMarkdown(v.md),
  }));
}

// One item per project that appears or whose entry changes in a commit to data/projects.json
function softwareItems() {
  const items = [];
  const last = new Map();
  for (const [hash, date] of commitsOf(PROJECTS_FILE)) {
    for (const p of parseJson(showAt(hash, PROJECTS_FILE))) {
      const entry = JSON.stringify(p);
      if (!p.name || last.get(p.name) === entry) continue;
      const link = p.url ? ` <a href="${esc(p.url)}">${esc(p.url)}</a>` : '';
      items.push({
        title: `Project: ${p.name} ${last.has(p.name) ? 'updated' : 'added'}`, link: `${SITE}/projects`,
        guid: `project:${p.name}:${hash}`, date, html: `<p>${esc(p.description || '')} (${esc(p.status || '')})${link}</p>`,
      });
      last.set(p.name, entry);
    }
  }
  return items;
}

// Gear and builds are dated by the note's updatedAt (createdAt without one); the date is in the guid,
// so an edited note comes back as a new item
function noteItems(notes, { prefix, fallback }) {
  return notes.filter(n => !isNaN(new Date(n.changedAt))).map(n => {
    const date = new Date(n.changedAt).toISOString();
    const rating = n.rating != null ? ` Rated ${n.rating}/10.` : '';
    const status = prefix === 'Build' && n.status ? ` (${n.status})` : '';
    return {
      title: `${prefix}: ${n.name}${status}`, link: `${SITE}${n.hasPage ? n.href : fallback}`,
      guid: `${prefix.toLowerCase()}:${n.slug}:${date}`, date, html: `<p>${esc(n.oneliner)}${rating}</p>`,
    };
  });
}

// One RSS 2.0 document: the newest MAX_ITEMS items, each with its HTML in a CDATA description
function rss({ file, title, page, description, items, related = '' }) {
  const latest = [...items].sort((a, b) => new Date(b.date) - new Date(a.date) || a.guid.localeCompare(b.guid)).slice(0, MAX_ITEMS);
  const body = latest.map(i => `    <item>
      <title>${esc(i.title)}</title>
      <link>${esc(i.link)}</link>
      <guid isPermaLink="false">${esc(i.guid)}</guid>
      <pubDate>${new Date(i.date).toUTCString()}</pubDate>
      <description>${cdata(i.html)}</description>
    </item>`).join('\n');
  // No lastBuildDate: it would change on every daily build and commit a feed with nothing new in it
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(title)}</title>
    <link>${SITE}${page}</link>
    <description>${esc(description)}</description>
    <language>en</language>
    <atom:link href="${SITE}/${file}" rel="self" type="application/rss+xml"/>${related}
${body}
  </channel>
</rss>
`;
}

// Writes feed.xml (everything below merged), now.xml, uses.xml and projects.xml at the site root
export async function writeFeeds(notes) {
  const now = nowItems();
  const uses = noteItems(notes.filter(n => n.isGear), { prefix: 'Uses', fallback: '/uses' });
  const projects = [
    ...softwareItems(),
    ...noteItems(notes.filter(n => n.isBuild), { prefix: 'Build', fallback: '/projects' }),
  ];
  // A note that is both gear and a build shows up in uses and projects; the site feed keeps one of them
  const seen = new Set();
  const site = [...now, ...uses, ...projects].filter(i => {
    const key = i.guid.replace(/^(uses|build):/, '');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const feeds = [
    { file: 'now.xml', title: 'Lucas Santos: now', page: '/now', items: now, description: 'What Lucas Santos is doing now, one item per update of the /now page' },
    { file: 'uses.xml', title: 'Lucas Santos: uses', page: '/uses', items: uses, description: 'Gear Lucas Santos uses, one item per added or updated gear note' },
    { file: 'projects.xml', title: 'Lucas Santos: projects', page: '/projects', items: projects, description: 'Software projects and builds by Lucas Santos, one item per added or changed entry' },
    {
      file: 'feed.xml', title: 'Lucas Santos', page: '/', items: site,
      description: `Updates to lsantos.dev from /now, /uses and /projects. Blog posts have their own feed at ${RSS_URL}`,
      related: `\n    <atom:link href="${esc(RSS_URL)}" rel="related" type="application/rss+xml"/>`,
    },
  ];
  // No notes means none were readable: only now.xml is complete without them, the others keep what they had
  const toWrite = notes.length ? feeds : feeds.filter(f => f.file === 'now.xml');
  for (const f of toWrite) await writeFile(f.file, rss(f));
  log.ok(`feeds written: ${toWrite.map(f => `${f.file} (${Math.min(f.items.length, MAX_ITEMS)})`).join(', ')}`);
}
