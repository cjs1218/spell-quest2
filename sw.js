// Service worker: lets Spell Quest open without internet and be installed on
// a home screen. App files are served from the cache straight away, then
// refreshed in the background so updates arrive on the next visit.
// Bump VERSION when files are added or removed.

const VERSION = "spellquest-v4";
const APP_FILES = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/styles.css",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png",
  ...[
    "app", "builder", "companion", "games", "garden", "groups", "mission", "mistakes",
    "pictures", "practice", "praise", "rainbow", "screens", "sounds", "speech", "store",
    "syllables", "ui", "words", "align", "today", "gate", "backup", "readaloud",
  ].map((f) => `./js/${f}.js`),
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) =>
      // Add files one by one so a single missing file can't break installing.
      Promise.all(APP_FILES.map((url) => cache.add(url).catch(() => null)))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const isFont = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (!sameOrigin && !isFont) return;

  // Cached copy first (works offline), refreshed from the network in the background.
  event.respondWith(
    caches.open(VERSION).then(async (cache) => {
      const cached = await cache.match(req, { ignoreSearch: sameOrigin });
      const network = fetch(req)
        .then((res) => {
          if (res && (res.ok || res.type === "opaque")) cache.put(req, res.clone());
          return res;
        })
        .catch(() => null);
      if (cached) {
        event.waitUntil(network);
        return cached;
      }
      const res = await network;
      if (res) return res;
      if (req.mode === "navigate") return cache.match("./index.html");
      return new Response("", { status: 504 });
    })
  );
});
