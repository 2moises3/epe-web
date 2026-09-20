const ACTIONS_STORE = 'actions'

type SyncServiceWorkerRegistration = ServiceWorkerRegistration & {
  sync: { register: (tag: string) => Promise<void> }
}

export interface PendingAction {
  id?: number
  url: string
  method: string
  body?: unknown
  createdAt: number
}

export async function queueAction(action: Omit<PendingAction, 'createdAt'>): Promise<void> {
  const database = await openQueueDatabase()
  database.transaction(ACTIONS_STORE, 'readwrite').objectStore(ACTIONS_STORE).add({ ...action, createdAt: Date.now() })
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    const registration = await navigator.serviceWorker.ready
    await (registration as SyncServiceWorkerRegistration).sync.register('epe-pending-actions')
  }
}

function openQueueDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('epe-offline', 2)
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains('session')) request.result.createObjectStore('session')
      if (!request.result.objectStoreNames.contains(ACTIONS_STORE)) request.result.createObjectStore(ACTIONS_STORE, { keyPath: 'id', autoIncrement: true })
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}
