// Service worker: keeps a full offline copy of the site so lessons work without internet.
// This is a template: scripts/pwa.mjs fills in VERSION and PRECACHE and writes dist/sw.js at build time.
//
// Updates: a new deploy changes this file, the browser installs the new version in the background,
// and it takes over the next time the app is opened (after all its tabs are closed). There is no
// skipWaiting on purpose: an open page must never mix files from two versions.
// Progress lives in localStorage and is not touched by the cache.

const VERSION = '__VERSION__';
const PRECACHE = __PRECACHE__;
const CACHE = `guj-de-${VERSION}`;

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k.startsWith('guj-de-') && k !== CACHE).map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== location.origin) return;
  event.respondWith(respond(request, url));
});

async function respond(request, url) {
  const cache = await caches.open(CACHE);
  // ignoreVary: scripts and fonts are CORS requests with an Origin header that the precache
  // requests did not have; with "Vary: Origin" they would never match. All files here are static.
  const hit = await cache.match(request, { ignoreSearch: true, ignoreVary: true });
  if (hit) return hit;
  if (request.mode === 'navigate' && !url.pathname.endsWith('/')) {
    const withSlash = await cache.match(`${url.pathname}/`);
    if (withSlash) return withSlash;
  }
  try {
    return await fetch(request);
  } catch (error) {
    // Offline and not cached (e.g. a page that does not exist): show the home page instead
    if (request.mode === 'navigate') return (await cache.match('/')) ?? Response.error();
    throw error;
  }
}
