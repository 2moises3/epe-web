const APP_CACHE_PREFIX = 'epe-shell-'

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys()
    await Promise.all(cacheNames.filter((name) => name.startsWith(APP_CACHE_PREFIX)).map((name) => caches.delete(name)))
    await self.clients.claim()
  })())
})

// Intentionally no fetch handler: all documents, assets, and API requests go to the network.

self.addEventListener('sync', (event) => {
  if (event.tag === 'epe-pending-actions') event.waitUntil(notifyClientsToSync())
})

async function notifyClientsToSync() {
  const clients = await self.clients.matchAll({ type: 'window' })
  clients.forEach((client) => client.postMessage({ type: 'SYNC_PENDING_ACTIONS' }))
}
