// Latest 3 blog posts on the homepage, from data/posts.json (written by sync.js from the blog RSS)
document.addEventListener('DOMContentLoaded', async () => {
  const list = document.getElementById('latest-posts');
  try {
    const res = await fetch('/data/posts.json');
    if (!res.ok) throw 0;
    const posts = await res.json();
    list.replaceChildren(...posts.slice(0, 3).map(p => {
      const link = el('a', null, p.title);
      link.href = p.link;
      const li = el('li');
      li.append(el('span', 'post-date', p.date), link);
      return li;
    }));
  } catch {
    list.replaceChildren(el('li', 'muted', 'no posts yet - run sync.js'));
  }
});
