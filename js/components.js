// <site-sidebar>: photo, name, nav and theme toggles, shared by every page
class SiteSidebar extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="sidebar-inner">
        <a href="/" class="photo-wrap">
          <img src="/img/avatar.webp" alt="Lucas Santos" class="photo" width="130" height="130">
        </a>
        <a href="/" class="sidebar-name">$ Lucas Santos</a>
        <div class="mobile-actions">
          <div class="theme-toggle">
            <button onclick="toggleTheme()">[light]</button>
          </div>
          <button class="hamburger" aria-label="Menu" onclick="this.closest('.sidebar-inner').classList.toggle('menu-open')">&#9776;</button>
        </div>
        <nav>

          <a href="/">/about</a>
          <a href="/uses">/uses</a>
          <a href="/now">/now</a>
          <a href="/projects">/projects</a>
          <a href="mailto:hello@lsantos.dev?subject=Contact%20through%20your%20website" target="_blank" rel="noopener">/contact</a>
          <a href="https://personality.lsantos.dev">/personality</a>
        </nav>
        <div class="theme-toggle desktop-only">
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
      <p class="copyright">&copy; ${new Date().getFullYear()} Lucas Santos</p>
    `;
  }
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
