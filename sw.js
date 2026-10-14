// Service worker (registered by js/theme.js): keeps a copy of every page and file you visit, so the site
// still opens offline. It always asks the network first, so it never serves an old page when online.
// Bump CACHE to drop every stored copy at once on the next visit.
const CACHE = 'lsantos-v2';
// Stored on install. Every path here must exist: one 404 fails the whole install and the worker never
// updates. Update this list when one of these files moves or is renamed
const ASSETS = ['/', '/css/style.css', '/js/theme.js', '/js/components.js', '/js/clock.js', '/favicon-sleep.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

// Network first, cache as the offline fallback. Only this site's own files are cached, keyed
// without the query string, so the cache holds at most one copy of each file
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  const key = url.origin + url.pathname;
  // The copy is cloned before the page reads the body; errors and partial (range) responses would
  // replace a good copy, or can't be stored. Both lifetimes are registered while the event is live
  const network = fetch(e.request).then(res => ({ res, copy: res.status === 200 ? res.clone() : null }));
  e.respondWith(network.then(r => r.res).catch(() => caches.match(key)));
  e.waitUntil(network.then(r => r.copy && caches.open(CACHE).then(c => c.put(key, r.copy))).catch(() => {}));
});
