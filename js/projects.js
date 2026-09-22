document.addEventListener('DOMContentLoaded', async () => {
  const el = document.getElementById('project-list');
  try {
    const res = await fetch('/data/projects.json');
    if (!res.ok) throw 0;
    const projects = await res.json();
    const order = { active: 0, inactive: 1, archived: 2 };
    projects.sort((a, b) => (order[a.status] ?? 3) - (order[b.status] ?? 3));
    el.innerHTML = projects.map(p => {
      const d = document.createElement('div');
      d.textContent = p.description;
      const safe = d.innerHTML;
      const link = p.url ? `<a href="${p.url}" target="_blank" rel="noopener" class="project-name">${p.name}</a>` : `<span class="project-name">${p.name}</span>`;
      return `<li class="project-item" data-status="${p.status}">
        <div class="project-header">
          ${link}
          <span class="project-status" data-status="${p.status}">${p.status}</span>
        </div>
        <div class="project-desc">${safe}</div>
      </li>`;
    }).join('');
  } catch {
    el.innerHTML = '<li class="muted">edit data/projects.json to add projects</li>';
  }
});
