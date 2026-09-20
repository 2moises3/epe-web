import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import './App.css'
import AdminLoginPage from './modules/auth/pages/AdminLoginPage'
import UsersModulesPage from './modules/users/pages/UsersModulesPage'
import CampaignsPage from './modules/campaigns/pages/CampaignsPage'
import CampaignDetailsPage from './modules/campaigns/pages/CampaignDetailsPage'
import CampaignProvidersPage from './modules/campaigns/pages/CampaignProvidersPage'
import CampaignCarrierPaymentsPage from './modules/campaigns/pages/CampaignCarrierPaymentsPage'
import ProvidersPage from './modules/providers/pages/ProvidersPage'
import CommercialPlanningPage from './modules/commercial-planning/pages/CommercialPlanningPage'
import DashboardLayout from '@/shared/layout/DashboardLayout'
import OfflinePage from '@/shared/components/OfflinePage'
import { clearSession, getSession, saveSession } from '@/shared/offline/session'

// Persistent layout wrapper for authenticated routes
const ProtectedLayout = ({ isAuthenticated, onLogout }: { isAuthenticated: boolean, onLogout: () => void }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return (
    <DashboardLayout onLogout={onLogout}>
      <Outlet />
    </DashboardLayout>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isOnline, setIsOnline] = useState(() => navigator.onLine)
  const [justReconnected, setJustReconnected] = useState(false)

  useEffect(() => {
    void getSession().then((session) => setIsAuthenticated(Boolean(session?.authenticated))).catch(() => setIsAuthenticated(false))
  }, [])

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setJustReconnected(true)
      window.setTimeout(() => setJustReconnected(false), 1400)
    }
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleLogin = () => {
    setIsAuthenticated(true)
    void saveSession({ authenticated: true, savedAt: Date.now() })
  }
  const handleLogout = () => {
    setIsAuthenticated(false)
    void clearSession()
  };

  if (!isOnline) return <OfflinePage />
  if (isAuthenticated === null) return null

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/login" 
          element={!isAuthenticated ? <AdminLoginPage onLogin={handleLogin} /> : <Navigate to="/modules" />} 
        />
        
        <Route element={<ProtectedLayout isAuthenticated={isAuthenticated} onLogout={handleLogout} />}>
          <Route path="/modules" element={<UsersModulesPage />} />
          <Route path="/campaigns" element={<CampaignsPage />} />
          <Route path="/campaigns/:id" element={<CampaignDetailsPage />} />
          <Route path="/campaigns/:id/providers" element={<CampaignProvidersPage />} />
          <Route path="/campaigns/:id/carrier-payments" element={<CampaignCarrierPaymentsPage />} />
          <Route path="/proveedores" element={<ProvidersPage />} />
          <Route path="/planificacion-comercial" element={<CommercialPlanningPage />} />
        </Route>
        
        <Route path="/" element={<Navigate to="/modules" />} />
        <Route path="*" element={<Navigate to="/modules" />} />
      </Routes>
      {justReconnected && <div className="online-transition" role="status">Conexión restaurada</div>}
    </BrowserRouter>
  )
}

export default App
