import * as Icons from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import useWindowSize from '../hooks/useWindowSize.js';
import { useNavigation } from '../context/NavigationContext';

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isMobile } = useWindowSize();
  const { navItems } = useNavigation();

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile) onClose?.();
  };

  if (isMobile && !isOpen) return null;

  return (
    <>
      {/* Mobile Overlay with blur */}
      {isMobile && isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(17, 24, 39, 0.6)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 40,
            top: 56,
          }}
        />
      )}

      <aside style={{
        width: 260, // Slightly wider for a more breathable layout
        background: '#000000', // Premium deep dark gradient
        fontFamily: '"Inter", "Segoe UI", sans-serif',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        height: isMobile ? 'calc(100vh - 56px)' : '100vh',
        position: isMobile ? 'fixed' : 'sticky',
        top: isMobile ? 56 : 0,
        left: 0,
        zIndex: isMobile ? 50 : 'auto',
        boxShadow: isMobile ? '4px 0 24px rgba(0, 0, 0, 0.2)' : 'none',
        borderRight: '1px solid rgba(255,255,255,0.05)',
      }}>
        {/* Logo and Branding Header */}
        <div style={{ 
          padding: '1.5rem 1.25rem', 
          borderBottom: '1px solid rgba(255,255,255,0.06)', 
          display: 'flex', 
          alignItems: 'center', 
          gap: 14 
        }}>
          <div style={{ 
            width: 50, 
            height: 50, 
            // Anant Red Gradient
          }}>
            <img src="../../public/Logo_Footer.jpg" alt="Anant Auto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#ffffff', letterSpacing: '-0.3px' }}>
              Anant Auto
            </div>
            <div style={{ 
              fontSize: 11, 
              fontWeight: 500,
              color: 'rgba(255,255,255,0.5)', 
              textTransform: 'uppercase', 
              letterSpacing: '0.08em',
              marginTop: 2
            }}>
              Management
            </div>
          </div>
        </div>

        {/* Dynamic Navigation */}
        <nav style={{ flex: 1, padding: '1.25rem 0.75rem', overflowY: 'auto' }}>
          {navItems.map(item => {
            const Icon = Icons[item.iconName];
            const active = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/');
            
            return (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: active ? 600 : 500,
                  // Sleek red highlight for active state
                  background: active ? 'linear-gradient(90deg, rgba(227,24,55,0.15) 0%, rgba(227,24,55,0) 100%)' : 'transparent',
                  color: active ? '#ffffff' : 'rgba(255,255,255,0.55)',
                  borderLeft: active ? '3px solid #E31837' : '3px solid transparent',
                  marginBottom: 4,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  if (!active) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.85)';
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.55)';
                  }
                }}
              >
                {Icon && <Icon size={18} style={{ color: active ? '#E31837' : 'inherit' }} />}
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ 
          padding: '1rem 1.25rem', 
          borderTop: '1px solid rgba(255,255,255,0.06)', 
          fontSize: 11, 
          color: 'rgba(255,255,255,0.3)',
          textAlign: 'center'
        }}>
          © 2026 Anant Automobiles
        </div>
      </aside>
    </>
  );
}