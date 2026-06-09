import { LogOut, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import useWindowSize from '../hooks/useWindowSize.js';

export default function TopBar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { isMobile } = useWindowSize();

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'A'; // Default to 'A' for Admin/Anant

  return (
    <header style={{
      // Light Glassmorphism effect
      background: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
      padding: isMobile ? '0 1rem' : '0 1.75rem',
      height: 64, // Slightly taller for a more premium feel
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexShrink: 0,
      gap: 16,
      fontFamily: '"Inter", "Segoe UI", sans-serif',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
      position: 'sticky',
      top: 0,
      zIndex: 30
    }}>
      {/* Hamburger Menu for Mobile */}
      {isMobile && (
        <button
          onClick={onMenuClick}
          style={{
            background: 'rgba(0,0,0,0.03)',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#111827',
            transition: 'background 0.2s'
          }}
        >
          <Menu size={22} />
        </button>
      )}

      {/* Title - Hidden on Mobile */}
      {!isMobile && (
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', letterSpacing: '-0.3px' }}>
            Dashboard Overview
          </div>
          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
            Comprehensive administration & management
          </div>
        </div>
      )}

      {/* Mobile Title - Shown on Mobile */}
      {isMobile && (
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Anant Auto</div>
        </div>
      )}

      {/* User Info and Logout - Right Side */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: isMobile ? 12 : 20,
        flexShrink: 0,
      }}>
        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{user?.email || 'System Administrator'}</div>
              <div style={{ fontSize: 11, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>{user?.role || 'Admin Privileges'}</div>
            </div>
            <div style={{ 
              width: 38, 
              height: 38, 
              background: 'linear-gradient(135deg, #E31837 0%, #C4122C 100%)', 
              borderRadius: '10px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: 14, 
              fontWeight: 700, 
              color: '#fff', 
              flexShrink: 0,
              boxShadow: '0 4px 10px rgba(227, 24, 55, 0.2)'
            }}>
              {initials}
            </div>
          </div>
        )}

        {isMobile && (
          <div style={{ 
            width: 34, 
            height: 34, 
            background: 'linear-gradient(135deg, #E31837 0%, #C4122C 100%)', 
            borderRadius: '8px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: 13, 
            fontWeight: 700, 
            color: '#fff', 
            flexShrink: 0 
          }}>
            {initials}
          </div>
        )}

        <div style={{ width: '1px', height: '24px', background: 'rgba(0,0,0,0.08)' }}></div>

        <button
          onClick={logout}
          style={{ 
            background: 'transparent', 
            border: 'none', 
            padding: '8px', 
            borderRadius: '8px', 
            fontSize: 13, 
            fontWeight: 600,
            cursor: 'pointer', 
            color: '#6B7280', 
            display: 'flex', 
            alignItems: 'center', 
            gap: 6, 
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = '#E31837';
            e.currentTarget.style.background = 'rgba(227, 24, 55, 0.05)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = '#6B7280';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <LogOut size={18} /> 
          {!isMobile && 'Sign Out'}
        </button>
      </div>
    </header>
  );
}