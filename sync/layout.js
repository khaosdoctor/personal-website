// The sidebar and footer every page shares. The bake stamps them between <!-- bake:sidebar --> and
// <!-- bake:footer --> markers inside <site-sidebar> and <site-footer> on the root pages (sync/bake.js)
// and in the gear/build page template (sync/render.js). Those two tags are plain wrappers: nothing
// defines them in JS, css/base.css only makes them blocks. js/components.js adds the behaviour
// (menu button, theme buttons, ASCII shimmer, favicon) and never writes this HTML

// Under the theme toggle on desktop, under the copyright on phones (css/base.css shows one of the two)
const AI_POLICY = '<a href="/ai-usage" class="ai-policy">[AI usage policy]</a>';

// Baked with the light theme's label; js/theme.js relabels both buttons for the theme the page shows
const THEME_BUTTON = '<button type="button">[dark]</button>';

const NAV = [
  ['/', '/index'],
  ['/about', '/about'],
  ['/now', '/now'],
  ['/friends', '/friends'],
  ['/uses', '/uses'],
  ['/projects', '/projects'],
  ['https://blog.lsantos.dev', '/blog'],
  ['mailto:hello@lsantos.dev?subject=Contact%20through%20your%20website', '/contact'],
];

// The cat before the name. Each row is a line of 10x10 pixels: letters are fur colors, E the eyes,
// dots are empty. All three are baked, only the first (tuxedo) visible; js/components.js shows a
// random one on every page load
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

// One <path> per color, one 1x1 square per pixel, so a cat is a handful of elements instead of ~70
function catGroup(rows, i) {
  const squares = {};
  for (const [y, row] of rows.entries()) {
    for (const [x, c] of [...row].entries()) {
      if (c !== '.') squares[c] = (squares[c] || '') + `M${x} ${y}h1v1h-1z`;
    }
  }
  const paths = Object.entries(squares).map(([c, d]) => `<path fill="${CAT_COLORS[c]}" d="${d}"/>`).join('');
  return `<g${i ? ' display="none"' : ''}>${paths}</g>`;
}
const CAT_SVG = `<svg class="name-cat" viewBox="0 0 10 10" width="18" height="18" shape-rendering="crispEdges" aria-hidden="true">${CATS.map(catGroup).join('')}</svg>`;

// avatar.webp as 52x31 ASCII, one per theme (dark ink on light, light ink on dark); hover or focus
// reveals the photo underneath. Whitespace inside the <pre> is the art, keep it as is
const ASCII_LIGHT = `


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
   -----===: -===++***= *#+**#%%%%%@@@@@@@@@@@`;
const ASCII_DARK = `


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
   %%##%###% ####*****# *=**++=---=:..::.:::::`;

// href is the page's own nav href ("/now"); its link gets the active style. Gear and build pages
// pass nothing, so no link is active there
export function sidebarHtml(href) {
  const nav = NAV.map(([to, label]) => to === href
    ? `<a href="${to}" class="active" aria-current="page">${label}</a>`
    : `<a href="${to}">${label}</a>`).join('\n          ');
  return `<div class="sidebar-inner">
        <a href="/" class="photo-wrap">
          <span class="photo-stack">
            <img src="/img/avatar.webp" alt="Lucas Santos" class="photo" width="130" height="130">
            <pre class="photo-ascii ascii-light" aria-hidden="true">${ASCII_LIGHT}</pre>
            <pre class="photo-ascii ascii-dark" aria-hidden="true">${ASCII_DARK}</pre>
          </span>
        </a>
        <a href="/" class="sidebar-name">${CAT_SVG} Lucas Santos</a>
        <div class="mobile-actions">
          <div class="theme-toggle">
            ${THEME_BUTTON}
          </div>
          <button type="button" class="hamburger" aria-label="Menu" aria-controls="site-nav" aria-expanded="false">&#9776;</button>
        </div>
        <nav id="site-nav" aria-label="Site">
          ${nav}
        </nav>
        <div class="theme-toggle desktop-only">
          ${THEME_BUTTON}
          ${AI_POLICY}
        </div>
      </div>`;
}

// Social links and copyright. The year is the bake's, so it moves on the first bake of a new year
// (CI bakes daily). The arrow on outside links comes from css/base.css
export function footerHtml() {
  return `<div class="footer-rule">
        <a href="https://github.lsantos.dev">[github]</a>
        <a href="https://blog.lsantos.dev">[blog]</a>
        <a href="https://twitter.lsantos.dev">[twitter (x)]</a>
        <a href="https://linkedin.lsantos.dev">[linkedin]</a>
        <a href="https://youtube.lsantos.dev">[youtube]</a>
        <a href="https://telegram.lsantos.dev">[telegram]</a>
        <p class="copyright">&copy; ${new Date().getFullYear()} Lucas Santos</p>
        ${AI_POLICY}
      </div>`;
}
