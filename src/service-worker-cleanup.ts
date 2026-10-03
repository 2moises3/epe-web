type WorkerHandle = { scriptURL: string }

type ServiceWorkerRegistrationLike = {
  scope: string
  active?: WorkerHandle | null
  waiting?: WorkerHandle | null
  installing?: WorkerHandle | null
  unregister: () => Promise<boolean>
}

type ServiceWorkerRegistryLike = {
  getRegistrations: () => Promise<readonly ServiceWorkerRegistrationLike[]>
}

type CacheStorageLike = {
  delete: (cacheName: string) => Promise<boolean>
}

const APP_SERVICE_WORKER_PATH = '/sw.js'
const APP_SERVICE_WORKER_SCOPE = '/'
const APP_CACHE_NAME = 'epe-shell-v1'

export async function cleanupLegacyServiceWorker(
  serviceWorker: ServiceWorkerRegistryLike,
  cacheStorage: CacheStorageLike,
  appOrigin: string,
): Promise<void> {
  const registrations = await serviceWorker.getRegistrations()
  const appOriginUrl = new URL(appOrigin)

  const appRegistrations = registrations.filter((registration) => {
    const worker = registration.active ?? registration.waiting ?? registration.installing
    if (!worker) return false

    const scriptUrl = new URL(worker.scriptURL)
    const scopeUrl = new URL(registration.scope)

    return scriptUrl.origin === appOriginUrl.origin
      && scriptUrl.pathname === APP_SERVICE_WORKER_PATH
      && scopeUrl.origin === appOriginUrl.origin
      && scopeUrl.pathname === APP_SERVICE_WORKER_SCOPE
  })

  await Promise.all(appRegistrations.map((registration) => registration.unregister()))
  await cacheStorage.delete(APP_CACHE_NAME)
}
