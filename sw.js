/* Tiletopia service worker v1.0.0 — full offline, no external requests */
const CACHE = "tiletopia-v1.0.0";
const ASSETS = [
  "./",
  "./index.html",
  "./game.js",
  "./manifest.webmanifest",
  "./assets/icon-1024.png",
  "./assets/icon-120.png",
  "./assets/icon-152.png",
  "./assets/icon-167.png",
  "./assets/icon-180.png",
  "./assets/icon-192.png",
  "./assets/icon-20.png",
  "./assets/icon-29.png",
  "./assets/icon-40.png",
  "./assets/icon-512.png",
  "./assets/icon-58.png",
  "./assets/icon-60.png",
  "./assets/icon-76.png",
  "./assets/icon-80.png",
  "./assets/icon-83.5.png",
  "./assets/icon-87.png",
  "./assets/icon-maskable-512.png"
];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  // serve the app shell for any navigation inside the scope, regardless of
  // trailing slash (Pages serves /tiletopia and /tiletopia/ interchangeably)
  if (e.request.mode === "navigate" || e.request.destination === "document") {
    e.respondWith(
      caches.match("./index.html").then((hit) => hit || fetch(e.request))
    );
    return;
  }
  // normalize: strip trailing slash on directory-ish requests, ignore query
  const req = url.pathname.endsWith("/") && !url.pathname.endsWith(".html")
    ? new Request(url.href + "index.html") : e.request;
  e.respondWith(caches.match(req, { ignoreSearch: true }).then((hit) => hit || fetch(e.request).then((res) => {
    const copy = res.clone();
    caches.open(CACHE).then((c) => c.put(req, copy));
    return res;
  }).catch(() => caches.match("./index.html"))));
});
