// Service Worker minimal — Where To Go Mtl
const CACHE = "wtg-v1";

// Assets à mettre en cache pour un démarrage instantané
const PRECACHE = ["/", "/manifest.json", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Network-first pour les requêtes API Supabase, cache-first pour les assets statiques
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);

  // Toujours aller au réseau pour Supabase
  if (url.hostname.includes("supabase.co")) return;

  // Cache-first pour les assets statiques
  if (e.request.method === "GET") {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(res => {
          if (res.ok && e.request.url.startsWith(self.location.origin)) {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return res;
        }).catch(() => cached);
      })
    );
  }
});
