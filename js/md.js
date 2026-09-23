import { marked } from 'https://cdn.jsdelivr.net/npm/marked@15/lib/marked.esm.js';

// Fetches a markdown file and renders it into target; returns the response so callers can read headers
export async function renderMarkdown(url, target) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  target.innerHTML = marked(await res.text());
  return res;
}

// Any element with data-md="/path/file.md" gets that file rendered into it
for (const target of document.querySelectorAll('[data-md]')) {
  renderMarkdown(target.dataset.md, target).catch(() => {
    target.replaceChildren(el('p', 'muted', 'nothing here yet'));
  });
}
