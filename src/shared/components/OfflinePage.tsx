import { CloudOff, RefreshCw } from 'lucide-react'

export default function OfflinePage() {
  return (
    <main className="offline-page">
      <div className="offline-glow" aria-hidden="true" />
      <section className="offline-card" aria-labelledby="offline-title">
        <div className="offline-icon"><CloudOff size={30} strokeWidth={1.8} /></div>
        <p className="offline-eyebrow">AGRO EXPORTACIONES</p>
        <h1 id="offline-title">Estás sin conexión</h1>
        <p className="offline-copy">No pudimos conectarnos al servidor. Tus datos de sesión siguen protegidos y volverás automáticamente cuando regrese internet.</p>
        <div className="offline-status"><span className="offline-dot" /> Esperando conexión</div>
        <button className="offline-retry" onClick={() => window.location.reload()}><RefreshCw size={16} /> Reintentar</button>
      </section>
    </main>
  )
}
