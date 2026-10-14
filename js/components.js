// Behaviour for the sidebar and footer every page shares. Their HTML is baked into each page from
// sync/layout.js, so this file never writes markup: it only wires up what is already there.
// Loaded with defer after theme.js, so it runs once the page is parsed.
// Code that only one page needs goes in its own deferred file instead (clock.js, gear.js).

// ═══ Theme buttons (sidebar) ═══

// The baked label is the light theme's ([dark]); theme.js sets the one for the theme the page shows
labelThemeButtons(document.documentElement.dataset.theme);
for (const btn of document.querySelectorAll('.theme-toggle button')) btn.addEventListener('click', toggleTheme);

// ═══ Phone menu (sidebar) ═══

// The menu button opens and closes the nav on phones (css/base.css only shows it there)
const hamburger = document.querySelector('.hamburger');
hamburger?.addEventListener('click', () => {
  hamburger.setAttribute('aria-expanded', hamburger.closest('.sidebar-inner').classList.toggle('menu-open'));
});

// ═══ Name cat (sidebar) ═══

// All three cats are baked into the sidebar with the first one showing; a random one shows on every page load
const cats = document.querySelectorAll('.name-cat g');
if (cats.length) {
  for (const cat of cats) cat.setAttribute('display', 'none');
  cats[Math.floor(Math.random() * cats.length)].removeAttribute('display');
}

// ═══ ASCII avatar shimmer (sidebar, desktop with a mouse) ═══

// Every tick a few chars of the ASCII avatar move one step along the ramp, and the next tick
// puts them back, so the art looks alive. One timer drives both arts; the hidden one (other
// theme) and background tabs are skipped
const RAMP = '@%#*+=-:. ';
function shimmer(pres) {
  const arts = [];
  for (const pre of pres) {
    const art = pre.textContent;
    const cells = [];
    for (const [i, c] of [...art].entries()) if (RAMP.slice(0, -1).includes(c)) cells.push(i);
    arts.push({ pre, art, cells });
  }
  setInterval(() => {
    if (document.hidden) return;
    for (const { pre, art, cells } of arts) {
      if (!pre.offsetParent) continue;
      const chars = [...art];
      for (let n = 0; n < 10; n++) {
        const i = cells[Math.floor(Math.random() * cells.length)];
        const step = Math.random() < 0.5 ? -1 : 1;
        // stops before the space at the end of the ramp, so no holes open up
        chars[i] = RAMP[Math.min(RAMP.length - 2, Math.max(0, RAMP.indexOf(chars[i]) + step))];
      }
      pre.textContent = chars.join('');
    }
  }, 150);
}

// Touch screens never show the art (see css/base.css), so no timer there.
// ponytail: checked once, a device that gains a mouse later stays still until reload
const stillArt = matchMedia('(prefers-reduced-motion: reduce)').matches || matchMedia('(hover: none)').matches;
if (!stillArt) shimmer(document.querySelectorAll('.photo-ascii'));

// ═══ Favicon (every page) ═══

// From midnight to noon in Stockholm the favicon is the sleeping cat. Checked every minute so an open tab swaps too
const favicon = document.querySelector('link[rel="icon"]');
const stockholmHour = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Stockholm', hour: 'numeric', hourCycle: 'h23' });
function updateFavicon() {
  const href = Number(stockholmHour.format(new Date())) < 12 ? '/favicon-sleep.svg' : '/favicon.svg';
  if (favicon.getAttribute('href') !== href) favicon.setAttribute('href', href);
}
if (favicon) {
  updateFavicon();
  setInterval(updateFavicon, 60000);
}
