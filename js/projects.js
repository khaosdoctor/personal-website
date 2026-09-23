// Project list from data/projects.json, sorted active -> inactive -> archived (unknown statuses go last)
const STATUS_ORDER = { active: 0, inactive: 1, archived: 2 };

document.addEventListener('DOMContentLoaded', async () => {
  const list = document.getElementById('project-list');
  try {
    const res = await fetch('/data/projects.json');
    if (!res.ok) throw 0;
    const projects = await res.json();
    projects.sort((a, b) => (STATUS_ORDER[a.status] ?? 3) - (STATUS_ORDER[b.status] ?? 3));

    list.replaceChildren(...projects.map(p => {
      // data-status drives the label color and the dimming in CSS
      const name = el(p.url ? 'a' : 'span', 'project-name', p.name);
      if (p.url) name.href = p.url;

      const status = el('span', 'project-status', p.status);
      status.dataset.status = p.status;

      const header = el('div', 'project-header');
      header.append(name, status);

      const li = el('li', 'project-item');
      li.dataset.status = p.status;
      li.append(header, el('div', 'project-desc', p.description));
      return li;
    }));
  } catch {
    list.replaceChildren(el('li', 'muted', 'edit data/projects.json to add projects'));
  }
});
