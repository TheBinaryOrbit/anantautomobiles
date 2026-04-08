import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function TopBar() {
  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <header style={{
      background: 'var(--bg-primary)',
      borderBottom: '0.5px solid var(--border-secondary)',
      padding: '0 1.5rem', height: 56,
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', flexShrink: 0,
    }}>
      <div>
        <div style={{ fontSize: 15, fontWeight: 600 }}>Bike Shop Admin</div>
        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Comprehensive bike shop management</div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 32, height: 32, background: '#534AB7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: '#fff', flexShrink: 0 }}>
            {initials}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{user?.email || 'Admin'}</div>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{user?.role || 'ADMIN'}</div>
          </div>
        </div>
        <button
          onClick={logout}
          style={{ background: 'none', border: '0.5px solid var(--border-primary)', padding: '6px 12px', borderRadius: 7, fontSize: 12, cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-sans)' }}
        >
          <LogOut size={13} /> Logout
        </button>
      </div>
    </header>
  );
}
