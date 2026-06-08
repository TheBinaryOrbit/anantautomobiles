import { useState } from 'react';
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
    if (!email || !password) { 
        toast.error('Please fill in all fields'); 
        return; 
    }
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
      background: 'linear-gradient(135deg, #e0e5ec 0%, #f4f7fb 100%)',
      fontFamily: '"Inter", "Segoe UI", sans-serif',
      padding: '2rem'
    }}>
      
      {/* Wide Split-Screen Glass Card */}
      <div style={{ 
        display: 'flex',
        flexDirection: 'row',
        background: 'rgba(255, 255, 255, 0.65)', 
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.5)', 
        borderRadius: '24px', 
        width: '100%',
        maxWidth: '960px',
        minHeight: '500px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.06)',
        overflow: 'hidden' // Keeps the inner left/right background constrained
      }}>
        
        {/* Left Column: Branding & Logo */}
        <div style={{ 
          flex: 1, 
          padding: '3rem',
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.3) 100%)',
          borderRight: '1px solid rgba(0,0,0,0.05)'
        }}>
          <div style={{ 
             
            borderRadius: '20px', 
            padding: '1.5rem',
            
            marginBottom: '2rem'
          }}>
            <img 
              src="../../public/Logo_Header.png" 
              alt="Anant Automobiles" 
              style={{ width: '260px', height: 'auto', display: 'block' }} 
            />
          </div>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#111827', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
              Anant Automobiles Management Portal
            </h1>
            <p style={{ fontSize: '15px', color: '#6B7280', margin: 0, lineHeight: '1.5' }}>
              Secure management system for <br/> automobile administration.
            </p>
          </div>
        </div>

        {/* Right Column: Login Form */}
        <div style={{ 
          flex: 1, 
          padding: '4rem 3.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: '#ffffff'
        }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', margin: '0 0 6px 0' }}>
              Welcome Back
            </h2>
            <p style={{ fontSize: '15px', color: '#6B7280', margin: 0 }}>
              Please enter your details to sign in.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
            <Field label="Email Address">
              <Input
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@anantauto.com"
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}
              />
            </Field>
            
            <Field label="Password">
              <Input
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}
              />
            </Field>
          </div>

          <Button 
            onClick={handleSubmit} 
            disabled={loading} 
            size="lg" 
            style={{ 
              width: '100%', 
              justifyContent: 'center', 
              background: 'linear-gradient(90deg, #E31837 0%, #C4122C 100%)',
              border: 'none',
              color: '#fff',
              fontWeight: 600,
              fontSize: '16px',
              borderRadius: '10px',
              padding: '0.875rem',
              boxShadow: '0 4px 14px rgba(227, 24, 55, 0.25)',
              cursor: 'pointer'
            }}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </Button>
        </div>

      </div>
    </div>
  );
}