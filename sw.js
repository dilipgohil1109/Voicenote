const CACHE = 'voicenote-v2';
const ASSETS = ['/', '/index.html', '/manifest.json', '/icon.svg'];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(c) { return c.addAll(ASSETS); })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  // Delete ALL old caches including v1
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE; })
            .map(function(k){ return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  // Network-first: always try to get fresh content, fall back to cache
  e.respondWith(
    fetch(e.request)
      .then(function(res) {
        // Cache the fresh response
        var clone = res.clone();
        caches.open(CACHE).then(function(c){ c.put(e.request, clone); });
        return res;
      })
      .catch(function() {
        // Offline fallback
        return caches.match(e.request).then(function(r){
          return r || caches.match('/index.html');
        });
      })
  );
});
