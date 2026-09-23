document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('gear-container');
  try {
    const res = await fetch('/data/gear/gear.json');
    if (!res.ok) throw 0;
    const items = await res.json();

    // Group by the category set in each note's x-personal-site-category
    const grouped = {};
    for (const item of items) (grouped[item.category || 'other'] ||= []).push(item);

    // Alphabetical, with "other" always last
    const categories = Object.keys(grouped).sort((a, b) => {
      if (a === 'other') return 1;
      if (b === 'other') return -1;
      return a.localeCompare(b);
    });

    const sections = [];
    for (const cat of categories) {
      // "flight-sim" -> "Flight Sim"
      const label = cat.split(/[\s-]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      const list = el('ul', 'gear-list');
      const section = el('div', 'gear-category');
      section.append(el('h2', null, label), list);

      // Highest rated first
      grouped[cat].sort((a, b) => (b.rating || 0) - (a.rating || 0));
      for (const g of grouped[cat]) {
        // The row links to the external page or the gear detail page; without either, the cells go straight into the <li>
        const li = el('li');
        const href = g.externalLink || (g.hasPage ? `/gear/${g.slug}.html` : '');
        const row = href ? el('a', 'gear-link') : li;
        if (href) {
          row.href = href;
          li.append(row);
        }
        row.append(
          el('span', 'gear-name', g.name),
          el('span', 'gear-desc', g.oneliner),
          el('span', 'gear-rating', `${g.rating}/10`),
        );
        list.append(li);
      }
      sections.push(section);
    }
    container.replaceChildren(...sections);

    // Descriptions cut off by the ellipsis show their full text in a tooltip on hover
    const tip = el('div', 'gear-tip');
    document.body.append(tip);

    for (const desc of container.querySelectorAll('.gear-desc')) {
      if (desc.scrollWidth <= desc.clientWidth) continue;
      desc.classList.add('truncated');
      desc.addEventListener('mouseenter', () => {
        const r = desc.getBoundingClientRect();
        tip.textContent = desc.textContent;
        tip.style.left = r.left + 'px';
        tip.style.top = (r.bottom + 4) + 'px';
        tip.classList.add('visible');
      });
      desc.addEventListener('mouseleave', () => tip.classList.remove('visible'));
    }
  } catch {
    container.replaceChildren(el('p', 'muted', 'no gear yet - run sync.js'));
  }
});
