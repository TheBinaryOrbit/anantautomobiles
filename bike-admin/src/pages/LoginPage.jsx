import { useState } from 'react';
import { Bike } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/services';
import { Field, Input, Button } from '../components/ui';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) { toast.error('Please fill in all fields'); return; }
    setLoading(true);
    try {
      const data = await authApi.login(email, password);
      if (data.success && data.data?.token) {
        login(data.data.token, data.data.user);
        toast.success('Welcome back!');
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch (err) {
      toast.error(err.message || 'Cannot reach server');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)' }}>
      <div style={{ background: 'var(--bg-primary)', border: '0.5px solid var(--border-primary)', borderRadius: 18, padding: '2.5rem', width: 380, boxShadow: 'var(--shadow-lg)' }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '2rem' }}>
          <div style={{ width: 42, height: 42, background: '#534AB7', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bike size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700 }}>Bike Shop Admin</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Management Portal</div>
          </div>
        </div>

        <Field label="Email">
          <Input
            type="email" value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="admin@bikeshop.com"
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
        </Field>
        <Field label="Password">
          <Input
            type="password" value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
        </Field>

        <Button onClick={handleSubmit} disabled={loading} size="lg" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </div>
    </div>
  );
}
