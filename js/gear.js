// The gear list is baked into uses.html by sync.js; this only adds a hover tooltip
// for descriptions cut off by the ellipsis
const tip = document.createElement('div');
tip.className = 'gear-tip';
document.body.append(tip);

for (const desc of document.querySelectorAll('.gear-desc')) {
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
