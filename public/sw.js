// Service worker: lets the site be installed as an app and shows a friendly offline page instead of
// the browser's error when there's no connection. It only handles page visits: admin pages, the API
// and everything else always go straight to the network, so nothing is ever served stale.
const CACHE = 'offline-v1'
const OFFLINE = '/offline'

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.add(OFFLINE)).then(() => self.skipWaiting()))
})
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()))
})
self.addEventListener('fetch', (event) => {
  const req = event.request
  const url = new URL(req.url)
  if (req.mode !== 'navigate' || req.method !== 'GET' || url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/api')) return
  event.respondWith(fetch(req).catch(() => caches.match(OFFLINE)))
})
