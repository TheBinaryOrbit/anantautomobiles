import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';

import LoginPage         from './pages/LoginPage';
import DashboardPage     from './pages/DashboardPage';
import BikesPage         from './pages/BikesPage';
import BikeModelsPage    from './pages/BikeModelsPage';
import AccessoriesPage   from './pages/AccessoriesPage';
import CustomersPage     from './pages/CustomersPage';
import SuppliersPage     from './pages/SuppliersPage';
import SalesPage         from './pages/SalesPage';
import SalesDetailPage   from './pages/SalesDetailPage';
import RolesPage         from './pages/RolesPage';
import UsersPage         from './pages/UsersPage';

import Sidebar from './components/Sidebar';
import TopBar  from './components/TopBar';

/* ── Authenticated shell with routes ── */
function AppShell() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-secondary)' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar />
        <main style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/bikes" element={<BikesPage />} />
            <Route path="/bike-models" element={<BikeModelsPage />} />
            <Route path="/accessories" element={<AccessoriesPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/suppliers" element={<SuppliersPage />} />
            <Route path="/sales" element={<SalesPage />} />
            <Route path="/sales/:id" element={<SalesDetailPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/roles" element={<RolesPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

/* ── Auth gate ── */
function AuthGate() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <AppShell /> : <LoginPage />;
}

/* ── Root ── */
export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AuthGate />
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
