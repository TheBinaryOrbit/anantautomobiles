import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import useWindowSize from './hooks/useWindowSize.js';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import BikesPage from './pages/BikesPage';
import BikeDetailPage from './pages/BikeDetailPage';
import BikeModelsPage from './pages/BikeModelsPage';
import AccessoriesPage from './pages/AccessoriesPage';
import CustomersPage from './pages/CustomersPage';
import SuppliersPage from './pages/SuppliersPage';
import PurchasesPage from './pages/PurchasesPage';
import PurchaseCreatePage from './pages/PurchaseCreatePage';
import PurchaseDetailPage from './pages/PurchaseDetailPage';
import SalesPage from './pages/SalesPage';
import SalesCreatePage from './pages/SalesCreatePage';
import SalesDetailPage from './pages/SalesDetailPage';
import RolesPage from './pages/RolesPage';
import UsersPage from './pages/UsersPage';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Home from './pages/Home.jsx';

/* ── Authenticated shell layout ── */
function AppShellLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isMobile } = useWindowSize();


  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-secondary)' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main style={{
          flex: 1,
          padding: isMobile ? '1rem' : '1.5rem',
          overflowY: 'auto'
        }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

/* ── Route guards ── */
function ProtectedLayout() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <AppShellLayout /> : <Navigate to="/" replace/>;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />

      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
      />

      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/bikes" element={<BikesPage />} />
        <Route path="/bikes/:id" element={<BikeDetailPage />} />
        <Route path="/bike-models" element={<BikeModelsPage />} />
        <Route path="/accessories" element={<AccessoriesPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/suppliers" element={<SuppliersPage />} />
        <Route path="/purchases" element={<PurchasesPage />} />
        <Route path="/purchases/new" element={<PurchaseCreatePage />} />
        <Route path="/purchases/:id" element={<PurchaseDetailPage />} />
        <Route path="/sales" element={<SalesPage />} />
        <Route path="/sales/new" element={<SalesCreatePage />} />
        <Route path="/sales/:id" element={<SalesDetailPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/roles" element={<RolesPage />} />
      </Route>

      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? '/dashboard' : '/'} replace />}
      />
    </Routes>
  );
}

/* ── Root ── */
export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnFocusLoss={false}
          pauseOnHover
          limit={4}
        />
      </AuthProvider>
    </Router>
  );
}
