const ACCENTS = {
  light: ['#d50612', '#0571b3', '#ac7d00', '#39936c', '#4b15a8'],
  dark: ['#e6242f', '#1480c2', '#f5b200', '#45b384', '#815bc2'],
};

function getDayIndex() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now - start) / 86400000) % ACCENTS.light.length;
}

function getTheme() {
  try {
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') return stored;
  } catch { /* private browsing */ }
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.style.setProperty('--accent', ACCENTS[theme][getDayIndex()]);
  const btn = document.querySelector('.theme-toggle button');
  if (btn) btn.textContent = theme === 'dark' ? '[light]' : '[dark]';
}

function toggleTheme() {
  const next = getTheme() === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem('theme', next); } catch { /* ok */ }
  applyTheme(next);
}

applyTheme(getTheme());

document.addEventListener('DOMContentLoaded', () => {
  const raw = location.pathname.replace(/\/$/, '').replace(/\.html$/, '').replace(/\/index$/, '');
  const path = raw || '/';
  for (const a of document.querySelectorAll('nav a[href]')) {
    const href = a.getAttribute('href').replace(/\/$/, '').replace(/\.html$/, '') || '/';
    if (path === href) a.classList.add('active');
  }
  applyTheme(getTheme());
});
