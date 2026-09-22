document.addEventListener('DOMContentLoaded', async () => {
  const el = document.getElementById('latest-posts');
  try {
    const res = await fetch('/data/posts.json');
    if (!res.ok) throw 0;
    const posts = await res.json();
    el.innerHTML = posts.slice(0, 3).map(p => {
      const d = document.createElement('div');
      d.textContent = p.title;
      const safe = d.innerHTML;
      return `<li><span class="post-date">${p.date}</span><a href="${p.link}" target="_blank" rel="noopener">${safe}</a></li>`;
    }).join('');
  } catch {
    el.innerHTML = '<li class="muted">no posts yet - run sync.js</li>';
  }
});
