// The gear list is baked into uses.html by sync.js; this shows each row's oneliner
// as a tooltip when hovering the row (mobile shows it under the name instead, via CSS)
const tip = document.createElement('div');
tip.className = 'gear-tip';
document.body.append(tip);

for (const row of document.querySelectorAll('.gear-list li')) {
  const desc = row.querySelector('.gear-desc')?.textContent.trim();
  if (!desc) continue;
  const name = row.querySelector('.gear-name');
  row.addEventListener('mouseenter', () => {
    const r = name.getBoundingClientRect();
    tip.textContent = desc;
    tip.style.left = r.left + 'px';
    tip.style.top = (r.bottom + 4) + 'px';
    tip.classList.add('visible');
  });
  row.addEventListener('mouseleave', () => tip.classList.remove('visible'));
}
