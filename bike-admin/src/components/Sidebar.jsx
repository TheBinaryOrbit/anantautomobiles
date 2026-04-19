import * as Icons from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import useWindowSize from '../hooks/useWindowSize.js';

const NAV_SECTIONS = [
  {
    label: 'Main',
    items: [
      { path: '/dashboard',            label: 'Dashboard',   iconName: 'LayoutDashboard' },
      { path: '/admin/bikes',  label: 'Bikes',       iconName: 'Bike',     badge: '48' },
      { path: '/bike-models', label: 'Bike Models', iconName: 'Layers' },
      { path: '/accessories', label: 'Accessories', iconName: 'Wrench' },
    ],
  },
  {
    label: 'People',
    items: [
      { path: '/customers', label: 'Customers', iconName: 'Users',    badge: '3' },
      { path: '/suppliers', label: 'Suppliers', iconName: 'Building2' },
    ],
  },
  {
    label: 'Commerce',
    items: [
      { path: '/sales', label: 'Sales', iconName: 'ShoppingCart' },
    ],
  },
  {
    label: 'Admin',
    items: [
      { path: '/users', label: 'Users', iconName: 'User' },
      { path: '/roles', label: 'Roles', iconName: 'KeyRound' },
    ],
  },
];

const styles = {
  sidebar: (isMobile) => ({
    width: 230,
    background: '#0d0d0d',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    height: isMobile ? 'calc(100vh - 56px)' : '100vh',
    position: isMobile ? 'fixed' : 'sticky',
    top: isMobile ? 56 : 0,
    left: 0,
    zIndex: isMobile ? 50 : 'auto',
    borderRight: '1px solid #1e1e1e',
    // Red top accent bar
    boxShadow: 'inset 0 3px 0 0 #E8001A',
  }),
  logoArea: {
    padding: '1.3rem 1.1rem 1.1rem',
    borderBottom: '1px solid #1e1e1e',
    display: 'flex',
    alignItems: 'center',
    gap: 11,
  },
  logoIcon: {
    width: 38,
    height: 38,
    background: '#E8001A',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 0 16px rgba(232,0,26,0.35)',
  },
  logoTextMain: {
    fontSize: 15,
    fontWeight: 700,
    color: '#fff',
    letterSpacing: '0.04em',
    lineHeight: 1.1,
    fontFamily: "'Rajdhani', sans-serif",
  },
  logoTextSub: {
    fontSize: 10,
    fontWeight: 500,
    color: '#E8001A',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: 9,
    fontWeight: 600,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: '#3a3a3a',
    padding: '1rem 1rem 0.3rem',
  },
  navItem: (active) => ({
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: active ? '8.5px 11px 8.5px 9px' : '8.5px 11px',
    borderRadius: 7,
    border: 'none',
    borderLeft: active ? '2px solid #E8001A' : '2px solid transparent',
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: active ? 500 : 400,
    background: active ? 'rgba(232,0,26,0.12)' : 'transparent',
    color: active ? '#EE2326' : '#6a6a6a',
    marginBottom: 1,
    transition: 'all 0.12s ease',
  }),
  badge: {
    marginLeft: 'auto',
    background: '#E8001A',
    color: '#fff',
    fontSize: 9,
    fontWeight: 700,
    padding: '1px 6px',
    borderRadius: 20,
  },
  footer: {
    padding: '0.85rem 1.1rem',
    borderTop: '1px solid #1a1a1a',
    display: 'flex',
    alignItems: 'center',
    gap: 9,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    background: '#1f1f1f',
    border: '1px solid #2e2e2e',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 10,
    fontWeight: 700,
    color: '#E8001A',
    flexShrink: 0,
  },
};

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isMobile } = useWindowSize();

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile) onClose?.();
  };

  if (isMobile && !isOpen) return null;

  return (
    <>
      {isMobile && isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.65)',
            zIndex: 40, top: 56,
          }}
        />
      )}

      <aside style={styles.sidebar(isMobile)}>
        {/* Logo */}
        <div style={styles.logoArea}>
          <div style={styles.logoIcon}>
            <Icons.Bike size={18} color="#fff" />
          </div>
          <div>
            <div style={styles.logoTextMain}>Anant Automobiles</div>
            {/* <div style={styles.logoTextSub}>Hero Authorised Dealer</div> */}
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '0.4rem 0.55rem', overflowY: 'auto' }}>
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              <div style={styles.sectionLabel}>{section.label}</div>
              {section.items.map((item) => {
                const Icon = Icons[item.iconName];
                const active =
                  location.pathname === item.path ||
                  (item.path === '/' && location.pathname === '/dashboard');
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigate(item.path)}
                    style={styles.navItem(active)}
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = '#1a1a1a';
                        e.currentTarget.style.color = '#cccccc';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#6a6a6a';
                      }
                    }}
                  >
                    {Icon && <Icon size={14} />}
                    {item.label}
                    {item.badge && <span style={styles.badge}>{item.badge}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div style={styles.footer}>
          <div style={styles.avatar}>AA</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#999' }}>Admin User</div>
            <div style={{ fontSize: 10, color: '#444' }}>Super Admin</div>
          </div>
        </div>
      </aside>
    </>
  );
}