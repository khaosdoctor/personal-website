document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('gear-container');
  try {
    const res = await fetch('/data/gear/gear.json');
    if (!res.ok) throw 0;
    const items = await res.json();

    const grouped = {};
    for (const item of items) {
      const cat = item.category || 'other';
      (grouped[cat] ||= []).push(item);
    }

    const categories = Object.keys(grouped).sort((a, b) => {
      if (a === 'other') return 1;
      if (b === 'other') return -1;
      return a.localeCompare(b);
    });

    let html = '';
    for (const cat of categories) {
      const group = grouped[cat];
      group.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      const label = cat.split(/[\s-]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      html += `<div class="gear-category">
        <h2>${label}</h2>
        <ul class="gear-list">
          ${group.map(g => {
            const d = document.createElement('div');
            d.textContent = g.oneliner;
            const safe = d.innerHTML;
            const inner = `<span class="gear-name">${g.name}</span>
              <span class="gear-desc">${safe}</span>
              <span class="gear-rating">${g.rating}/10</span>`;
            if (g.externalLink) {
              return `<li><a href="${g.externalLink}" target="_blank" rel="noopener" class="gear-link">${inner}</a></li>`;
            } else if (g.hasPage) {
              return `<li><a href="/gear/${g.slug}.html" class="gear-link">${inner}</a></li>`;
            }
            return `<li>${inner}</li>`;
          }).join('')}
        </ul>
      </div>`;
    }
    container.innerHTML = html;

    const tip = document.createElement('div');
    tip.className = 'gear-tip';
    document.body.appendChild(tip);

    for (const el of container.querySelectorAll('.gear-desc')) {
      if (el.scrollWidth > el.clientWidth) {
        el.classList.add('truncated');
        el.addEventListener('mouseenter', () => {
          const r = el.getBoundingClientRect();
          tip.textContent = el.textContent;
          tip.style.left = r.left + 'px';
          tip.style.top = (r.bottom + 4) + 'px';
          tip.classList.add('visible');
        });
        el.addEventListener('mouseleave', () => {
          tip.classList.remove('visible');
        });
      }
    }
  } catch {
    container.innerHTML = '<p class="muted">no gear yet - run sync.js</p>';
  }
});
