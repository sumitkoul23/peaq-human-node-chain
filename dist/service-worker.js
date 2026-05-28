const PHN_CACHE = "phn-beacon-v9";
const PHN_ASSETS = [
  "./",
  "./index.html",
  "./buy.html",
  "./staking.html",
  "./exchange.html",
  "./wallet.html",
  "./activate-node.html",
  "./download.html",
  "./vesting.html",
  "./roadmap.html",
  "./achievements.html",
  "./support.html",
  "./verify.html",
  "./phn.css",
  "./phn-app.js",
  "./offline.html",
  "./assets/phn-logo-minimal.svg",
  "./assets/phn-logo-minimal-192.png",
  "./assets/phn-logo-minimal-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(PHN_CACHE).then((cache) => cache.addAll(PHN_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== PHN_CACHE).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        const copy = response.clone();
        if (response.ok && event.request.url.startsWith(self.location.origin)) {
          caches.open(PHN_CACHE).then((cache) => cache.put(event.request, copy));
        }
        return response;
      }).catch(() => caches.match("./offline.html"));
    })
  );
});
