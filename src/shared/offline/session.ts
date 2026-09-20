const DATABASE_NAME = 'epe-offline'
const STORE_NAME = 'session'
const SESSION_KEY = 'current'

export interface PersistedSession {
  authenticated: boolean
  savedAt: number
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 2)
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) request.result.createObjectStore(STORE_NAME)
      if (!request.result.objectStoreNames.contains('actions')) request.result.createObjectStore('actions', { keyPath: 'id', autoIncrement: true })
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function getSession(): Promise<PersistedSession | undefined> {
  const database = await openDatabase()
  return new Promise((resolve, reject) => {
    const request = database.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(SESSION_KEY)
    request.onsuccess = () => resolve(request.result as PersistedSession | undefined)
    request.onerror = () => reject(request.error)
  })
}

export async function saveSession(session: PersistedSession): Promise<void> {
  const database = await openDatabase()
  database.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).put(session, SESSION_KEY)
}

export async function clearSession(): Promise<void> {
  const database = await openDatabase()
  database.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).delete(SESSION_KEY)
}
