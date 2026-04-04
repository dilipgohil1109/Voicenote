const CACHE = 'voicenote-v3';
const ASSETS = ['/index.html', '/manifest.json', '/icon.svg'];
self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(ASSETS);}));
  self.skipWaiting();
});
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);}));
  }));
  self.clients.claim();
});
self.addEventListener('fetch', function(e){
  e.respondWith(
    fetch(e.request).then(function(r){
      var c=r.clone();
      caches.open(CACHE).then(function(cache){cache.put(e.request,c);});
      return r;
    }).catch(function(){
      return caches.match(e.request);
    })
  );
});
