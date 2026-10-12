// The page's path the way nav hrefs and AI_USAGE keys write it: /now.html, /now/ and /now are all /now, /index.html is /
function currentPath() {
  return location.pathname.replace(/(\/index)?(\.html)?\/?$/, '') || '/';
}

// <site-sidebar>: photo, name, nav and theme toggles, shared by every page
class SiteSidebar extends HTMLElement {
  connectedCallback() {
    // theme.js already set data-theme in <head>; the toggle offers the other one
    const toggle = document.documentElement.dataset.theme === 'dark' ? '[light]' : '[dark]';
    this.innerHTML = `
      <div class="sidebar-inner">
        <a href="/" class="photo-wrap">
          <span class="photo-stack">
            <img src="/img/avatar.webp" alt="Lucas Santos" class="photo" width="130" height="130">
            <!-- avatar.webp as 52x31 ASCII, one per theme (dark ink on light, light ink on dark); hover or focus reveals the photo underneath -->
            <pre class="photo-ascii ascii-light" aria-hidden="true">


               =*%##%%@
             =###%%%@@@@@@
           +#*%%*#%@@@@@   @
          #%%#%**+**#####%@@@
         #%##=-=+===+******#@@
         %#*+. :--=++++***#*#@
         #**+. .-=*#**+*#%@%#%
        *###-.:-*%%%%##%%%%%%%
        +#%*-+#*#%@@##%%@%%%##
        *%%#***%#*##*#=+%%####
        +**+...-++*##+=+*%%#%##
        ==-=....:=+**#%%@@%*##%
        +-+=-...:+*###%%%@%#**%
         =:-+-::=+#%%%##%%@%*#%
          ==*+=+******##%###%%
             +**#*+==+*####%@%
             =+#%#****###%@@@
              :+%%@@@@@@@@@@%#
              -:+#%@@@@@@@@%%
              *::-*#%%@@%%%%    @
               :.:+****#*#%##*   @@
              =:.:=++==+*%%=*#@@@@@
            *=:+--+*##%@@@+*%@@@@@@@@@
          *+=.-=+#%%@@@@%#+@@@@%@@@@@@@@
       *+===- ===+**###***%@@%**###%%@@@@@@@
      +=----:.====++****+*@@%***#####*%@@@@@@
     ---:==- :====+****+:%@#*****%%%%#*@@@@@@
    ::-:===: :==+++****:-@*+*####*%@@@#%@@@@@
   -----===: -===++***= *#+**#%%%%%@@@@@@@@@@@</pre>
            <pre class="photo-ascii ascii-dark" aria-hidden="true">


               #*==+--:
             #=++-=-:.
           *++--+=-: :.
          =--+=+***+++++==:
         +=+=###*###**+**++=-.
         -++*@@%%##*****+++++.
         =++#@@%%#*++**+=---+-
        *+==#@%#+=--===-----=-
        *==+%*++==:.==--:=--++
        *===+++=+*++++#*--====
        **+*@@@#**+++*#*+-=====
        ####@@@@%#*+++==::=+++=
        *###%@@%%**+++=--:-+++=
         #%%*%%%#*+---===-:-+=-
          ##+*#*+*****+===++--
             **+=+*##*++=+==:-
             #*===+*++++=-:.
              %*=--::::..   -+
              #%*+-:      .-=
              *%%#*=--::----
               %@%#*++++++-=++
              #%@%#*###*+--#++   ..
            *#%*##*++=-:  *+-.. ......
          **#@%#*+--:::--=*:  :-::....:.
       +*####@###**++++++*-..-+++===-:...:::
      *#%%##%@####***+++*+ .=+++====+*-.:::::
     %%%%### %####**+++*%-:+*++++--=-=+:.::-:
    %%%%###% %###***++*%%:+*+++==+-::.+-.::::
   %%##%###% ####*****# *=**++=---=:..::.:::::</pre>
          </span>
        </a>
        <a href="/" class="sidebar-name">${catSvg()} Lucas Santos</a>
        <div class="mobile-actions">
          <div class="theme-toggle">
            <button onclick="toggleTheme()">${toggle}</button>
          </div>
          <button class="hamburger" aria-label="Menu" onclick="this.closest('.sidebar-inner').classList.toggle('menu-open')">&#9776;</button>
        </div>
        <nav>

          <a href="/">/index</a>
          <a href="/about">/about</a>
          <a href="https://personality.lsantos.dev">/personality</a>
          <a href="/now">/now</a>
          <a href="/friends">/friends</a>
          <a href="/uses">/uses</a>
          <a href="/projects">/projects</a>
          <a href="https://blog.lsantos.dev">/blog</a>
          <a href="mailto:hello@lsantos.dev?subject=Contact%20through%20your%20website" target="_blank" rel="noopener">/contact</a>
        </nav>
        <div class="theme-toggle desktop-only">
          <button onclick="toggleTheme()">${toggle}</button>
        </div>
      </div>
    `;
    // Highlights the current page's link
    const here = currentPath();
    for (const a of this.querySelectorAll('nav a')) if (a.getAttribute('href') === here) a.classList.add('active');
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Touch screens never show the art (see style.css), so no timer there.
    // ponytail: checked once, a device that gains a mouse later stays still until reload
    if (matchMedia('(hover: none)').matches) return;
    shimmer(this.querySelectorAll('.photo-ascii'));
  }
}

// A random one of these takes the place of the $ before the name, on every page load.
// Each row is a line of 10x10 pixels: letters are fur colors, E the eyes, dots are empty
const CAT_COLORS = { K: 'var(--cat-black)', W: '#f4f1ea', O: '#e8913a', D: '#b5611c', E: '#9fd356' };
const CATS = [
  // tuxedo
  ['K.....K...', 'KK...KK...', 'KKKKKKK...', 'KEKKKEK...', 'KKKWKKK...',
   '.KWWWK....', 'KKWWWKK..K', 'KKWWWKK..K', 'KKWWWKK.K.', 'KWWKWWKK..'],
  // tortie
  ['O.....K...', 'OO...KK...', 'OOOKKKK...', 'OEOKKEK...', 'OOKKKKK...',
   '.KKKKO....', 'KKKKOOO..K', 'KKKOOOO..K', 'KKKKOOK.O.', 'KKKKKKKO..'],
  // orange
  ['O.....O...', 'OO...OO...', 'ODODODO...', 'OEOOOEO...', 'OOOWOOO...',
   '.OWWWO....', 'DOOOOOD..O', 'OOOOOOO..D', 'DOOOOOD.O.', 'OOOOOOOO..'],
];
function catSvg() {
  const rows = CATS[Math.floor(Math.random() * CATS.length)];
  let rects = '';
  for (const [y, row] of rows.entries()) {
    for (const [x, c] of [...row].entries()) {
      if (c !== '.') rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${CAT_COLORS[c]}"/>`;
    }
  }
  return `<svg class="name-cat" viewBox="0 0 10 10" width="18" height="18" shape-rendering="crispEdges" aria-hidden="true">${rects}</svg>`;
}

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

// How much AI went into each page, shown next to the copyright and linked to /ai-usage.
// Say either 'written by a human' or 'AI helped with X'. Keys are paths as currentPath() writes them;
// a key also covers every page under it (/gear covers /gear/akg-k72). Pages not listed get the default
const AI_USAGE_DEFAULT = 'AI helped with the code';
const AI_USAGE = {
  '/gear': 'AI helped with the code and transcription',
  '/builds': 'AI helped with the code and transcription',
  '/ai-usage': 'AI helped with the writing',
};
function aiUsage() {
  const here = currentPath();
  const section = Object.keys(AI_USAGE).find((key) => here.startsWith(`${key}/`));
  return AI_USAGE[here] ?? AI_USAGE[section] ?? AI_USAGE_DEFAULT;
}

// <site-footer>: social links, copyright and the AI usage label (the external-link pass below opens the links in a new tab)
class SiteFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="footer-rule">
      <a href="https://github.lsantos.dev">[github]</a>
      <a href="https://blog.lsantos.dev">[blog]</a>
      <a href="https://twitter.lsantos.dev">[twitter (x)]</a>
      <a href="https://linkedin.lsantos.dev">[linkedin]</a>
      <a href="https://youtube.lsantos.dev">[youtube]</a>
      <a href="https://telegram.lsantos.dev">[telegram]</a>
      <p class="copyright">&copy; ${new Date().getFullYear()} Lucas Santos <a href="/ai-usage" class="ai-usage">// ${aiUsage()}</a></p>
      </div>
    `;
  }
}

customElements.define('site-sidebar', SiteSidebar);
customElements.define('site-footer', SiteFooter);

// Any link to another host opens in a new tab and gets the .ext arrow. Every link is in the page
// (baked, or rendered by the components above) by the time the DOM is ready, so one pass is enough
document.addEventListener('DOMContentLoaded', () => {
  for (const a of document.querySelectorAll('a[href]')) {
    if (!a.hostname || a.hostname === location.hostname) continue;
    a.target = '_blank';
    a.rel = 'noopener';
    a.classList.add('ext');
  }
});
