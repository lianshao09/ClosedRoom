// Closed room service worker.
// Caches only the static app shell so the page opens fast and is installable.
// It never sees chat data: messages travel over WebRTC, not through fetch().
// Bump VERSION whenever any cached file changes, so old caches are dropped.
const VERSION = "v2";
const CACHE = "closedroom-" + VERSION;
const SHELL = [
  "./",
  "index.html",
  "how-it-works.html",
  "manifest.webmanifest",
  "icon-192.png",
  "icon-512.png",
  "icon-maskable-512.png",
  "apple-touch-icon.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    // One missing file must not abort the whole install, so add files individually.
    caches.open(CACHE)
      .then((cache) => Promise.allSettled(SHELL.map((file) => cache.add(file))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("closedroom-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Same-origin pages: network first (so updates show up), cache as offline fallback.
  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req, { ignoreSearch: true }).then((hit) => hit || caches.match("index.html")))
    );
    return;
  }

  // Trystero from the CDN (pinned version): cache first, so the app still loads its code offline.
  if (url.hostname === "cdn.jsdelivr.net" && url.pathname.includes("/trystero@")) {
    event.respondWith(
      caches.match(req).then((hit) => {
        if (hit) return hit;
        return fetch(req).then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        });
      })
    );
  }
  // Everything else (relays use WebSocket, which fetch handlers never see) passes through untouched.
});
