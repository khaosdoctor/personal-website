// Accent color rotates daily through this palette, one set per theme. It is the link color, so every
// value keeps at least 4.5:1 contrast on its theme's background (darker or lighter brand shades)
const ACCENTS = {
  light: ['#d50612', '#0571b3', '#8b6500', '#2e7757', '#4b15a8'],
  dark: ['#e93c46', '#1d85c4', '#f5b200', '#45b384', '#906fc9'],
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

// Each theme button (mobile + desktop) offers the other theme
function labelThemeButtons(theme) {
  for (const btn of document.querySelectorAll('.theme-toggle button'))
    btn.textContent = theme === 'dark' ? '[light]' : '[dark]';
}

// Sets the theme and accent, and relabels the theme buttons. On the first run in <head> the buttons
// are not parsed yet, so js/components.js labels them once the page is there
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.style.setProperty('--accent', ACCENTS[theme][getDayIndex()]);
  labelThemeButtons(theme);
}

// Switches to the other theme from the one the page shows, so it still works when storage is blocked
// and getTheme() can't see the save
function toggleTheme() {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem('theme', next); } catch { /* ok */ }
  applyTheme(next);
}

// Runs in <head> so the page never flashes the wrong theme
applyTheme(getTheme());

// Registered after load, so the worker's precache doesn't race the page's own first requests
if ('serviceWorker' in navigator) addEventListener('load', () => navigator.serviceWorker.register('/sw.js'));
