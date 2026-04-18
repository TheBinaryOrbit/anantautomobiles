import { LogOut, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import useWindowSize from '../hooks/useWindowSize.js';

const styles = {
  header: (isMobile) => ({
    background: '#0d0d0d',
    borderBottom: '1px solid #1e1e1e',
    // Red top accent bar
    boxShadow: 'inset 0 3px 0 0 #E8001A',
    padding: isMobile ? '0 1rem' : '0 1.5rem',
    height: 56,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0,
    gap: 12,
    fontFamily: "'Barlow', sans-serif",
  }),
  hamburger: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#888',
    flexShrink: 0,
  },
  titleDesktop: {
    fontFamily: "'Rajdhani', sans-serif",
    fontSize: 16,
    fontWeight: 700,
    color: '#fff',
    letterSpacing: '0.04em',
    lineHeight: 1.1,
  },
  titleSub: {
    fontSize: 10,
    color: '#444',
    letterSpacing: '0.04em',
    marginTop: 1,
  },
  titleMobile: {
    flex: 1,
    fontFamily: "'Rajdhani', sans-serif",
    fontSize: 15,
    fontWeight: 700,
    color: '#fff',
    letterSpacing: '0.04em',
  },
  rightGroup: (isMobile) => ({
    display: 'flex',
    alignItems: 'center',
    gap: isMobile ? 8 : 14,
    flexShrink: 0,
  }),
  divider: {
    width: 1,
    height: 22,
    background: '#2a2a2a',
  },
  avatar: {
    width: 32,
    height: 32,
    background: '#1a0003',
    border: '1.5px solid #E8001A',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Rajdhani', sans-serif",
    fontSize: 12,
    fontWeight: 700,
    color: '#EE2326',
    flexShrink: 0,
  },
  avatarSm: {
    width: 30,
    height: 30,
    background: '#1a0003',
    border: '1.5px solid #E8001A',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Rajdhani', sans-serif",
    fontSize: 11,
    fontWeight: 700,
    color: '#EE2326',
    flexShrink: 0,
  },
  userName: {
    fontSize: 13,
    fontWeight: 500,
    color: '#ddd',
    lineHeight: 1.1,
  },
  userRole: {
    fontSize: 9,
    color: '#E8001A',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginTop: 1,
  },
  logoutBtn: (isMobile) => ({
    background: 'transparent',
    border: '1px solid #2a2a2a',
    borderRadius: 7,
    padding: isMobile ? '6px 8px' : '6px 12px',
    fontSize: 12,
    fontFamily: "'Barlow', sans-serif",
    fontWeight: 500,
    color: '#666',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    letterSpacing: '0.02em',
    whiteSpace: 'nowrap',
    transition: 'all 0.13s',
  }),
};

export default function TopBar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { isMobile } = useWindowSize();

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <header style={styles.header(isMobile)}>
      {/* Hamburger — mobile only */}
      {isMobile && (
        <button onClick={onMenuClick} style={styles.hamburger}>
          <Menu size={20} />
        </button>
      )}

      {/* Title */}
      {!isMobile ? (
        <div>
          <div style={styles.titleDesktop}>Anant Automobiles Admin</div>
          <div style={styles.titleSub}>Comprehensive bike shop management</div>
        </div>
      ) : (
        <div style={styles.titleMobile}>Anant Automobiles</div>
      )}

      {/* Right side */}
      <div style={styles.rightGroup(isMobile)}>
        {!isMobile && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <div style={styles.avatar}>{initials}</div>
              <div>
                <div style={styles.userName}>{user?.email || 'Admin'}</div>
                <div style={styles.userRole}>{user?.role || 'Admin'}</div>
              </div>
            </div>
            <div style={styles.divider} />
          </>
        )}

        {isMobile && <div style={styles.avatarSm}>{initials}</div>}

        <button
          onClick={logout}
          style={styles.logoutBtn(isMobile)}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = '#E8001A';
            e.currentTarget.style.color = '#EE2326';
            e.currentTarget.style.background = 'rgba(232,0,26,0.06)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = '#2a2a2a';
            e.currentTarget.style.color = '#666';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <LogOut size={13} />
          {!isMobile && 'Logout'}
        </button>
      </div>
    </header>
  );
}