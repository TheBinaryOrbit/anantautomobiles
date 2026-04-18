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
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url("https://hfcl-website-cms.s3.ap-south-1.amazonaws.com/Page_81_blog_5_10_Best_Hero_Models_List_Hero_Bikes_Price_in_India_2024_d9ee190d74.png")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      backdropFilter: 'blur(8px)',
      position: 'relative'
    }}>
      {/* Blur overlay */}
      <div style={{ 
        position: 'absolute', 
        inset: 0, 
        backdropFilter: 'blur(3px)',
        pointerEvents: 'none'
      }} />
      
      <div style={{ 
        background: 'var(--bg-primary)', 
        border: '0.5px solid var(--border-primary)', 
        borderRadius: 18, 
        padding: '2.5rem', 
        width: 380, 
        boxShadow: 'var(--shadow-lg)',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '2rem' }}>
          <div style={{ width: 42, height: 42, background: '#EE2326', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
