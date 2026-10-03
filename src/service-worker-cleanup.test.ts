import { describe, expect, it, vi } from 'vitest'
import { cleanupLegacyServiceWorker } from './service-worker-cleanup'

function registration(scriptURL: string, scope = 'http://localhost:5173/') {
  return {
    scope,
    active: { scriptURL },
    unregister: vi.fn().mockResolvedValue(true),
  }
}

describe('cleanupLegacyServiceWorker', () => {
  it('unregisters only this application service worker and deletes its cache', async () => {
    const appWorker = registration('http://localhost:5173/sw.js')
    const unrelatedWorker = registration('http://localhost:5173/other-worker.js')
    const otherOriginWorker = registration('http://other.test/sw.js', 'http://other.test/')
    const serviceWorker = { getRegistrations: vi.fn().mockResolvedValue([appWorker, unrelatedWorker, otherOriginWorker]) }
    const cacheStorage = { delete: vi.fn().mockResolvedValue(true) }

    await cleanupLegacyServiceWorker(serviceWorker, cacheStorage, 'http://localhost:5173')

    expect(appWorker.unregister).toHaveBeenCalledOnce()
    expect(unrelatedWorker.unregister).not.toHaveBeenCalled()
    expect(otherOriginWorker.unregister).not.toHaveBeenCalled()
    expect(cacheStorage.delete).toHaveBeenCalledExactlyOnceWith('epe-shell-v1')
  })

  it('does not unregister a same-script worker with a narrower scope', async () => {
    const scopedWorker = registration('http://localhost:5173/sw.js', 'http://localhost:5173/app/')
    const serviceWorker = { getRegistrations: vi.fn().mockResolvedValue([scopedWorker]) }
    const cacheStorage = { delete: vi.fn().mockResolvedValue(false) }

    await cleanupLegacyServiceWorker(serviceWorker, cacheStorage, 'http://localhost:5173')

    expect(scopedWorker.unregister).not.toHaveBeenCalled()
  })
})
