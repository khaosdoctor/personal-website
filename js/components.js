// <site-sidebar>: photo, name, nav and theme toggles, shared by every page
class SiteSidebar extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="sidebar-inner">
        <a href="/" class="photo-wrap">
          <span class="photo-stack">
            <img src="/img/avatar.webp" alt="Lucas Santos" class="photo" width="130" height="130">
            <!-- 16x16 version of avatar.webp; hover or focus reveals the photo underneath -->
            <img src="/img/avatar-pixel.svg" alt="" class="photo-pixel" width="130" height="130" aria-hidden="true">
          </span>
        </a>
        <a href="/" class="sidebar-name">$ Lucas Santos</a>
        <div class="mobile-actions">
          <div class="theme-toggle">
            <button onclick="toggleTheme()">[light]</button>
          </div>
          <button class="hamburger" aria-label="Menu" onclick="this.closest('.sidebar-inner').classList.toggle('menu-open')">&#9776;</button>
        </div>
        <nav>

          <a href="/">/index</a>
          <a href="https://blog.lsantos.dev">/blog</a>
          <a href="/builds">/builds</a>
          <a href="mailto:hello@lsantos.dev?subject=Contact%20through%20your%20website" target="_blank" rel="noopener">/contact</a>
          <a href="/friends">/friends</a>
          <a href="/now">/now</a>
          <a href="https://personality.lsantos.dev">/personality</a>
          <a href="/projects">/projects</a>
          <a href="/uses">/uses</a>
        </nav>
        <div class="theme-toggle desktop-only">
          <svg class="sidebar-cat" viewBox="0 0 10 10" width="20" height="20" shape-rendering="crispEdges" aria-hidden="true">
            <path fill="currentColor" d="M0 0h1v1h-1zM6 0h1v1h-1zM0 1h2v1h-2zM5 1h2v1h-2zM0 2h7v1h-7zM0 3h1v1h-1zM2 3h3v1h-3zM6 3h1v1h-1zM0 4h7v1h-7zM1 5h5v1h-5zM0 6h7v1h-7zM9 6h1v1h-1zM0 7h7v1h-7zM9 7h1v1h-1zM0 8h7v1h-7zM8 8h1v1h-1zM0 9h8v1h-8z"/>
            <path fill="var(--accent)" d="M1 3h1v1h-1zM5 3h1v1h-1z"/>
          </svg>
          <button onclick="toggleTheme()">[light]</button>
        </div>
      </div>
    `;
  }
}

// <site-footer>: social links and copyright
class SiteFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <a href="https://github.lsantos.dev" target="_blank" rel="noopener">[github]</a>
      <a href="https://blog.lsantos.dev" target="_blank" rel="noopener">[blog]</a>
      <a href="https://twitter.lsantos.dev" target="_blank" rel="noopener">[twitter (x)]</a>
      <a href="https://linkedin.lsantos.dev" target="_blank" rel="noopener">[linkedin]</a>
      <a href="https://youtube.lsantos.dev" target="_blank" rel="noopener">[youtube]</a>
      <a href="https://telegram.lsantos.dev" target="_blank" rel="noopener">[telegram]</a>
      <p class="copyright">&copy; ${new Date().getFullYear()} Lucas Santos<!-- bake:heartbeat -->
<span class="heartbeat"> · last pushed <time datetime="2026-10-11T20:52:29Z">2026-10-11</time>, to <a href="https://github.com/khaosdoctor/personal-website">personal-website</a></span>
<!-- /bake:heartbeat --></p>
    `;
    const pushed = this.querySelector('.heartbeat time');
    if (pushed) pushed.textContent = timeAgo(new Date(pushed.dateTime)) || pushed.textContent;
  }
}

// sync.js bakes the last push time; turning it into "3 days ago" here keeps it right between builds
const RTF = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
const UNITS = [['year', 31536000], ['month', 2592000], ['day', 86400], ['hour', 3600], ['minute', 60]];
function timeAgo(date) {
  if (isNaN(date)) return '';
  const seconds = (date - Date.now()) / 1000;
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return RTF.format(Math.round(seconds / size), unit);
  }
  return 'just now';
}

customElements.define('site-sidebar', SiteSidebar);
customElements.define('site-footer', SiteFooter);

// Any link to another host opens in a new tab and gets the .ext arrow; the observer also catches links rendered after load
new MutationObserver(() => {
  for (const a of document.querySelectorAll('a[href]:not(.ext)')) {
    if (a.hostname && a.hostname !== location.hostname) {
      a.target = '_blank';
      a.rel = 'noopener';
      a.classList.add('ext');
    }
  }
}).observe(document.documentElement, { childList: true, subtree: true });
