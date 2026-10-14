// Accent color rotates daily through this palette, one set per theme
const ACCENTS = {
  light: ['#d50612', '#0571b3', '#ac7d00', '#39936c', '#4b15a8'],
  dark: ['#e6242f', '#1480c2', '#f5b200', '#45b384', '#815bc2'],
};

// Day of the year, wrapped to the palette size
function getDayIndex() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now - start) / 86400000) % ACCENTS.light.length;
}

// Saved choice wins, otherwise follow the OS setting
function getTheme() {
  try {
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') return stored;
  } catch { /* private browsing */ }
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Sets the theme and accent, and relabels both toggle buttons (mobile + desktop)
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.style.setProperty('--accent', ACCENTS[theme][getDayIndex()]);
  for (const btn of document.querySelectorAll('.theme-toggle button'))
    btn.textContent = theme === 'dark' ? '[light]' : '[dark]';
}

// Flips what the page shows, so it still works when storage is blocked and getTheme() can't see the save
function toggleTheme() {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem('theme', next); } catch { /* ok */ }
  applyTheme(next);
}

// Runs in <head> so the page never flashes the wrong theme
applyTheme(getTheme());

// Registered after load, so the worker's precache doesn't race the page's own first requests
if ('serviceWorker' in navigator) addEventListener('load', () => navigator.serviceWorker.register('/sw.js'));
