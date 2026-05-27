import * as Icons from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import useWindowSize from '../hooks/useWindowSize.js';

const NAV_ITEMS = [
  { path: '/',             label: 'Dashboard',    iconName: 'LayoutDashboard' },
  { path: '/bikes',        label: 'Bikes',        iconName: 'Bike' },
  { path: '/bike-models',  label: 'Bike Models',  iconName: 'Layers' },
  { path: '/accessories',  label: 'Accessories',  iconName: 'Wrench' },
  { path: '/customers',    label: 'Customers',    iconName: 'Users' },
  { path: '/suppliers',    label: 'Suppliers',    iconName: 'Building2' },
  { path: '/purchases',    label: 'Purchases',    iconName: 'Truck' },
  { path: '/sales',        label: 'Sales',        iconName: 'ShoppingCart' },
  { path: '/users',        label: 'Users',        iconName: 'User' },
  { path: '/roles',        label: 'Roles',        iconName: 'KeyRound' },
];

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isMobile } = useWindowSize();

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile) onClose?.();
  };

  // Only show sidebar when isOpen is true on mobile, always show on desktop
  if (isMobile && !isOpen) return null;

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 40,
            top: 56,
          }}
        />
      )}

      <aside style={{
        width: 224,
        background: 'var(--bg-sidebar)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        height: isMobile ? 'calc(100vh - 56px)' : '100vh',
        position: isMobile ? 'fixed' : 'sticky',
        top: isMobile ? 56 : 0,
        left: 0,
        zIndex: isMobile ? 50 : 'auto',
        boxShadow: isMobile ? '2px 0 8px rgba(0, 0, 0, 0.1)' : 'none',
      }}>
        {/* Logo */}
        <div style={{ 
          padding: '1.25rem 1.1rem', 
          borderBottom: '1px solid rgba(255,255,255,0.06)', 
          display: 'flex', 
          alignItems: 'center', 
          gap: 10 
        }}>
          <div style={{ 
            width: 34, 
            height: 34, 
            background: '#534AB7', 
            borderRadius: 9, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            flexShrink: 0 
          }}>
            <Icons.Bike size={17} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>Anant Automobiles</div>
            <div style={{ 
              fontSize: 10, 
              color: 'rgba(255,255,255,0.45)', 
              textTransform: 'uppercase', 
              letterSpacing: '0.06em' 
            }}>Admin</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '0.6rem 0.5rem', overflowY: 'auto' }}>
          {NAV_ITEMS.map(item => {
            const Icon = Icons[item.iconName];
            const active = location.pathname === item.path || (item.path === '/' && location.pathname === '/dashboard');
            return (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 11px',
                  borderRadius: 8,
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: active ? 500 : 400,
                  background: active ? 'rgba(83,74,183,0.25)' : 'transparent',
                  color: active ? '#A89EFF' : 'rgba(255,255,255,0.5)',
                  marginBottom: 2,
                  transition: 'all 0.12s',
                }}
                onMouseEnter={e => {
                  if (!active) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
                  }
                }}
              >
                {Icon && <Icon size={15} />}
                {item.label}
              </button>
            );
          })}
        </nav>

        <div style={{ 
          padding: '0.75rem 1.1rem', 
          borderTop: '1px solid rgba(255,255,255,0.06)', 
          fontSize: 10, 
          color: 'rgba(255,255,255,0.25)' 
        }}>
          © 2025 Bike Shop Admin
        </div>
      </aside>
    </>
  );
}
