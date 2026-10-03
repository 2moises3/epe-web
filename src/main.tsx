import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { cleanupLegacyServiceWorker } from './service-worker-cleanup'

if ('serviceWorker' in navigator) {
  void cleanupLegacyServiceWorker(navigator.serviceWorker, window.caches, window.location.origin)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
