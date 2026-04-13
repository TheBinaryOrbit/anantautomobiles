import { LogOut, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import useWindowSize from '../hooks/useWindowSize.js';

export default function TopBar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { isMobile } = useWindowSize();

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <header style={{
      background: 'var(--bg-primary)',
      borderBottom: '0.5px solid var(--border-secondary)',
      padding: isMobile ? '0 1rem' : '0 1.5rem',
      height: 56,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexShrink: 0,
      gap: 12,
    }}>
      {/* Hamburger Menu for Mobile */}
      {isMobile && (
        <button
          onClick={onMenuClick}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-primary)',
          }}
        >
          <Menu size={20} />
        </button>
      )}

      {/* Title - Hidden on Mobile */}
      {!isMobile && (
        <div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>Anant Automobiles Admin</div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Comprehensive bike shop management</div>
        </div>
      )}

      {/* Mobile Title - Shown on Mobile */}
      {isMobile && (
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Anant Automobiles</div>
        </div>
      )}

      {/* User Info and Logout - Right Side */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: isMobile ? 8 : 12,
        flexShrink: 0,
      }}>
        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 32, height: 32, background: '#534AB7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: '#fff', flexShrink: 0 }}>
              {initials}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{user?.email || 'Admin'}</div>
              <div style={{ fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{user?.role || 'ADMIN'}</div>
            </div>
          </div>
        )}

        {isMobile && (
          <div style={{ width: 32, height: 32, background: '#534AB7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: '#fff', flexShrink: 0 }}>
            {initials}
          </div>
        )}

        <button
          onClick={logout}
          style={{ 
            background: 'none', 
            border: '0.5px solid var(--border-primary)', 
            padding: isMobile ? '6px 8px' : '6px 12px', 
            borderRadius: 7, 
            fontSize: isMobile ? 11 : 12, 
            cursor: 'pointer', 
            color: 'var(--text-secondary)', 
            display: 'flex', 
            alignItems: 'center', 
            gap: isMobile ? 4 : 6, 
            fontFamily: 'var(--font-sans)',
            whiteSpace: 'nowrap',
          }}
        >
          <LogOut size={isMobile ? 13 : 13} /> 
          {!isMobile && 'Logout'}
        </button>
      </div>
    </header>
  );
}
