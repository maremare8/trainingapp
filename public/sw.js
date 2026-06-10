// Minimal service worker for the Tabata Timer PWA.
// Strategy:
//  - Precache the app shell so the installed app can boot offline.
//  - Network-first for navigations (so fresh content wins when online,
//    falling back to cache when offline).
//  - Stale-while-revalidate for Supabase GET requests (lets a saved workout
//    you've already viewed load again offline).
//  - Cache-first for static assets.

const CACHE = "tabata-shell-v1";
const API_CACHE = "tabata-api-v1";
const SHELL = ["/", "/history", "/settings", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(SHELL))
      .catch(() => undefined)
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== CACHE && k !== API_CACHE)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Supabase REST: stale-while-revalidate so previously-fetched workout data
  // is available when offline. Auth endpoints are not cached.
  if (
    url.hostname.endsWith(".supabase.co") &&
    url.pathname.startsWith("/rest/")
  ) {
    event.respondWith(
      caches.open(API_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const network = fetch(request)
          .then((res) => {
            if (res.ok) cache.put(request, res.clone());
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
    return;
  }

  // Don't intercept other cross-origin requests (e.g. Supabase auth).
  if (url.origin !== self.location.origin) return;

  // Network-first for page navigations.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
          return res;
        })
        .catch(() => caches.match(request).then((r) => r || caches.match("/")))
    );
    return;
  }

  // Cache-first for static assets.
  if (
    url.pathname.startsWith("/_next/") ||
    url.pathname.startsWith("/icons/")
  ) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
            return res;
          })
      )
    );
  }
});
