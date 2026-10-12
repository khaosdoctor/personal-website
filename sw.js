const CACHE = 'lsantos-v2';
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
  e.respondWith(
    fetch(e.request)
      .then(res => {
        // errors and partial (range) responses would replace a good copy, or can't be stored
        if (res.status !== 200) return res;
        const clone = res.clone();
        e.waitUntil(caches.open(CACHE).then(c => c.put(key, clone)));
        return res;
      })
      .catch(() => caches.match(key))
  );
});
