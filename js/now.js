import { renderMarkdown } from './md.js';

// Renders data/now.md into the page, so updating /now means editing that one file
const content = document.getElementById('now-content');
try {
  const res = await renderMarkdown('/data/now.md', content);

  // "Last updated" comes from the file's Last-Modified header, shown as YYYY-MM-DD
  const lastMod = new Date(res.headers.get('last-modified') || Date.now());
  const d = lastMod.getDate().toString().padStart(2, '0');
  const m = (lastMod.getMonth() + 1).toString().padStart(2, '0');
  document.getElementById('now-date').textContent = `${lastMod.getFullYear()}-${m}-${d}`;
} catch {
  content.replaceChildren(el('p', 'muted', 'nothing here yet'));
}
