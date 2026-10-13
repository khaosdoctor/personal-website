import { readFile, writeFile, stat } from 'fs/promises';
import { join } from 'path';
import { execFileSync } from 'child_process';
import { marked } from 'marked';
import { debug, log, SITE, DATA_DIR } from './options.js';
import { postsHtml, gearHtml, buildsHtml, projectsHtml, sortLists } from './render.js';
import { writeFeeds } from './feeds.js';

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

export async function bakePages(posts, notes) {
  log.step('🥐 Baking pages');
  const md = async f => marked(await readFile(join(DATA_DIR, f), 'utf-8'));
  const nowUpdated = lastCommitDate(join(DATA_DIR, 'now.md')) || (await stat(join(DATA_DIR, 'now.md'))).mtime.toISOString().slice(0, 10);
  const projects = JSON.parse(await readFile(join(DATA_DIR, 'projects.json'), 'utf-8'));

  // No posts means the feed was unreachable; leaving the block out keeps whatever was baked last time
  await bake('index.html', { bio: await md('bio.md'), ...(posts && { posts: postsHtml(posts) }) });
  await bake('now.html', { now: await md('now.md'), 'now-date': nowUpdated });
  await bake('about.html', { about: await md('about.md') });
  await bake('ai-usage.html',{ 'ai-usage': await md('ai-usage.md') });
  await bake('friends.html', { friends: marked(sortLists(await readFile(join(DATA_DIR, 'friends.md'), 'utf-8'))) });

  // No notes means no source was readable, not that the gear is gone. Rewriting /uses, /projects
  // (which mixes in the builds) and the sitemap here would publish empty lists, so they keep what they have.
  if (!notes.length) {
    log.warn('no gear or build notes found, leaving /uses, /projects and the sitemap untouched');
    return;
  }

  await bake('uses.html', { gear: gearHtml(notes.filter(n => n.isGear)) });
  // Software and builds share the /projects sections by status; inactive software sits with the archived
  const builds = notes.filter(n => n.isBuild);
  const software = status => projectsHtml(projects.filter(p => status.includes(p.status)));
  const built = status => buildsHtml(builds.filter(b => status.includes(b.status)));
  const both = (...lists) => lists.filter(Boolean).join('\n');
  await bake('projects.html', {
    'projects-active': both(software(['active', 'in-progress']), built(['in-progress'])),
    'projects-planned': built(['planned']),
    'projects-done': both(built(['done']), software(['done']), software(['inactive', 'archived'])),
  });

  const urls = ['/', '/about', '/now', '/projects', '/uses', '/friends', '/ai-usage', ...notes.filter(n => n.hasPage).map(n => n.href)];
  const sitemap = urls.map(u => `  <url><loc>${SITE}${u}</loc></url>`).join('\n');
  await writeFile('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemap}\n</urlset>\n`);
  await writeFeeds(notes);
}
