import { marked } from 'https://cdn.jsdelivr.net/npm/marked@15/lib/marked.esm.js';

const el = document.getElementById('now-content');
try {
  const res = await fetch('/data/now.md');
  if (!res.ok) throw 0;
  const md = await res.text();
  el.innerHTML = marked(md);
  const lastMod = new Date(res.headers.get('last-modified') || Date.now());
  const d = lastMod.getDate().toString().padStart(2, '0');
  const m = (lastMod.getMonth() + 1).toString().padStart(2, '0');
  document.getElementById('now-date').textContent = `${lastMod.getFullYear()}-${m}-${d}`;
} catch {
  el.innerHTML = '<p class="muted">nothing here yet</p>';
}
