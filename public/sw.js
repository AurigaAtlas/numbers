// Offline support. The build fills in VERSION and PRECACHE (see vite.config.js);
// in dev this file is not registered.
const VERSION = "dev";
const PRECACHE = [];

const BUILD_CACHE = `build-${VERSION}`;
const MEDIA_CACHE = "media"; // pictures and voice clips: kept across releases

const isMedia = (url) => /\.(webp|png|mp3|json)$/.test(url.pathname) && !url.pathname.endsWith("manifest.webmanifest");

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const build = await caches.open(BUILD_CACHE);
    const media = await caches.open(MEDIA_CACHE);
    await Promise.all(PRECACHE.map(async (path) => {
      const url = new URL(path, self.registration.scope);
      const cache = isMedia(url) ? media : build;
      if (await cache.match(url)) return;
      try {
        await cache.add(url);
      } catch {
        // One missing file must not block the update.
      }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((name) => name.startsWith("build-") && name !== BUILD_CACHE).map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) return cached;
    throw error;
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const refresh = fetch(request)
    .then((response) => {
      if (response.ok || response.type === "opaque") cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);
  return cached ?? refresh;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, BUILD_CACHE).catch(() => caches.match(new URL("./", self.registration.scope))));
    return;
  }
  if (url.origin === self.location.origin) {
    // The voice manifest can change without its name changing, so check the network first.
    if (url.pathname.endsWith("/voice/manifest.json")) event.respondWith(networkFirst(request, MEDIA_CACHE));
    else event.respondWith(staleWhileRevalidate(request, isMedia(url) ? MEDIA_CACHE : BUILD_CACHE));
    return;
  }
  if (url.hostname.endsWith("fonts.googleapis.com") || url.hostname.endsWith("fonts.gstatic.com")) {
    event.respondWith(staleWhileRevalidate(request, MEDIA_CACHE));
  }
});
