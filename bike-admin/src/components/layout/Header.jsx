import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Search, Bell, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(() => window.innerWidth);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const isSmUp = windowWidth >= 640;
  const isLgUp = windowWidth >= 1024;

  const styles = {
    header: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      background: '#fff',
      borderBottom: '1px solid #dc2626',
    },
    container: {
      maxWidth: '80rem',
      margin: '0 auto',
      padding: '0 1rem',
      display: 'flex',
      alignItems: 'center',
      height: '66px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 0,
    },
    logoLink: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.625rem',
      textDecoration: 'none',
      marginRight: '2rem',
      flexShrink: 0,
    },
    logoBadge: {
      width: '2.5rem',
      height: '2.5rem',
      borderRadius: '0.75rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 800,
      fontSize: '15px',
      color: '#fff',
      background: '#FF0000',
    },
    logoTextWrap: {
      display: 'flex',
      flexDirection: 'column',
      lineHeight: 1,
    },
    logoName: {
      fontWeight: 800,
      fontSize: '20px',
      color: '#111827',
      letterSpacing: '-0.02em',
    },
    logoSub: {
      fontSize: '14px',
      fontWeight: 700,
      letterSpacing: '1.6px',
      textTransform: 'uppercase',
      marginTop: '2px',
      color: '#FF0000',
    },
    nav: {
      display: 'flex',
      alignItems: 'center',
      gap: '2px',
      flexShrink: 0,
    },
    navLink: {
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      padding: '6px 13px',
      borderRadius: '0.5rem',
      fontSize: '16px',
      fontWeight: 600,
      textDecoration: 'none',
      transition: 'color 150ms ease',
    },
    navIndicator: {
      position: 'absolute',
      bottom: '4px',
      left: '13px',
      right: '13px',
      height: '1.5px',
      borderRadius: '999px',
      background: '#FF0000',
      transition: 'transform 220ms cubic-bezier(.4,0,.2,1)',
      transformOrigin: 'center',
    },
    searchWrap: {
      display: 'flex',
      flex: 1,
      alignItems: 'center',
      gap: '1rem',
      margin: '0 1.25rem',
      padding: '0 0.875rem',
      height: '40px',
      borderRadius: '15px',
      background: 'rgba(0,0,0,0.04)',
      border: '1px solid rgba(0,0,0,0.12)',
      transition: 'all 150ms ease',
    },
    searchInput: {
      width: '100%',
      background: 'transparent',
      fontSize: '13.5px',
      color: '#1f2937',
      outline: 'none',
      border: 0,
      caretColor: '#FF0000',
    },
    desktopIcons: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
      flexShrink: 0,
    },
    bellButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: '0.75rem',
      color: 'rgba(0,0,0,0.45)',
      background: 'none',
      border: 'none',
      padding: 0,
      cursor: 'pointer',
      transition: 'color 150ms ease',
    },
    mobileRight: {
      display: 'flex',
      alignItems: 'center',
      gap: '2px',
      marginLeft: 'auto',
    },
    mobileToggle: {
      width: '38px',
      height: '38px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '0.5rem',
      transition: 'all 150ms ease',
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
    },
    mobileMenu: {
      padding: '0.75rem',
      background: '#fff',
      borderTop: '1px solid rgba(255,0,0,0.20)',
    },
    mobileSearch: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0 0.875rem',
      height: '40px',
      borderRadius: '10px',
      marginBottom: '0.625rem',
      background: 'rgba(0,0,0,0.04)',
      border: '1px solid rgba(0,0,0,0.12)',
    },
    mobileNav: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
    },
    mobileNavLink: {
      fontSize: '15px',
      fontWeight: 600,
      padding: '0.625rem 0.75rem',
      borderRadius: '0.5rem',
      color: 'rgba(0,0,0,0.75)',
      textDecoration: 'none',
      transition: 'all 150ms ease',
    },
    authButton: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '38px',
      minWidth: '108px',
      padding: '0 1rem',
      borderRadius: '10px',
      border: '1px solid #FF0000',
      background: '#FF0000',
      color: '#fff',
      fontSize: '14px',
      fontWeight: 700,
      textDecoration: 'none',
      marginLeft: '1rem',
      transition: 'all 150ms ease',
    },
    mobileAuthLink: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      boxSizing: 'border-box',
      marginTop: '0.75rem',
      height: '40px',
      borderRadius: '10px',
      border: '1px solid #FF0000',
      background: '#FF0000',
      color: '#fff',
      fontSize: '14px',
      fontWeight: 700,
      textDecoration: 'none',
    },
  };

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Buy Bike', path: '/public-bikes' },
    { name: 'Services', path: '/services' },
    { name: 'Blogs', path: '/blogs' },
    { name: 'Offers', path: '/offers' },
  ];

  const authAction = isAuthenticated
    ? { label: 'Dashboard', path: '/dashboard' }
    : { label: 'Login', path: '/login' };

  return (
    <header style={styles.header}>
      <div
        style={{
          ...styles.container,
          padding: isSmUp ? '0 1.75rem' : '0 1rem',
        }}
      >

        {/* Logo */}
        <Link to="/" style={styles.logoLink}>
          <div style={styles.logoBadge}>
            AA
          </div>
          <div style={styles.logoTextWrap}>
            <span style={styles.logoName}>Anant</span>
            <span style={styles.logoSub}>
              Automobiles
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        {isLgUp && <nav style={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              style={({ isActive }) => ({
                ...styles.navLink,
                color: isActive ? '#111827' : '#6b7280',
                fontWeight: isActive ? 700 : 600,
              })}
            >
              {({ isActive }) => (
                <>
                  <span style={{ position: 'relative', zIndex: 1 }}>
                    {item.name}
                  </span>
                  <span
                    style={{
                      ...styles.navIndicator,
                      transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
                    }}
                  />
                </>
              )}
            </NavLink>
          ))}
        </nav>}

        {isSmUp && (
          <Link
            to={authAction.path}
            style={styles.authButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#dc2626';
              e.currentTarget.style.borderColor = '#dc2626';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#FF0000';
              e.currentTarget.style.borderColor = '#FF0000';
            }}
          >
            {authAction.label}
          </Link>
        )}

        

        {/* Mobile right */}
        {!isSmUp && <div style={styles.mobileRight}>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              ...styles.mobileToggle,
              color: mobileOpen ? '#FF0000' : 'rgba(0,0,0,0.6)',
            }}
          >
            {mobileOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>}
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div style={styles.mobileMenu}>
          

          <nav style={styles.mobileNav}>
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                style={styles.mobileNavLink}
                onMouseEnter={e => { e.currentTarget.style.color = '#FF0000'; e.currentTarget.style.background = 'rgba(255,0,0,0.06)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(0,0,0,0.75)'; e.currentTarget.style.background = 'transparent'; }}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <Link
            to={authAction.path}
            onClick={() => setMobileOpen(false)}
            style={styles.mobileAuthLink}
          >
            {authAction.label}
          </Link>
        </div>
      )}
    </header>
  );
}