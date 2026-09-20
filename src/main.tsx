import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    const hadController = Boolean(navigator.serviceWorker.controller)
    if (hadController) {
      navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload(), { once: true })
    }
    window.addEventListener('load', () => {
      void navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' })
        .then((registration) => registration.update())
    })
  } else {
    // Vite dev should always load the current source; remove any worker/cache left by an older setup.
    window.addEventListener('load', () => {
      void Promise.all([
        navigator.serviceWorker.getRegistrations().then((registrations) => Promise.all(registrations.map((registration) => registration.unregister()))),
        caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith('epe-shell-')).map((key) => caches.delete(key)))),
      ]).then(([registrations]) => {
        if (registrations.length > 0 && !sessionStorage.getItem('epe-dev-worker-removed')) {
          sessionStorage.setItem('epe-dev-worker-removed', '1')
          window.location.reload()
        }
      })
    })
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
