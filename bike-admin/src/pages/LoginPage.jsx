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
    <>
      <style>
        {`
          .login-wrapper {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #e0e5ec 0%, #f4f7fb 100%);
            font-family: "Inter", "Segoe UI", sans-serif;
            padding: 2rem;
          }
          .login-card {
            display: flex;
            flex-direction: row;
            background: rgba(255, 255, 255, 0.65);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.5);
            border-radius: 24px;
            width: 100%;
            max-width: 960px;
            min-height: 500px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.06);
            overflow: hidden;
          }
          .login-left {
            flex: 1;
            padding: 3rem;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            background: linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.3) 100%);
            border-right: 1px solid rgba(0,0,0,0.05);
          }
          .login-logo-box {
            border-radius: 20px;
            padding: 1.5rem;
            margin-bottom: 2rem;
          }
          .login-logo {
            width: 260px;
            height: auto;
            display: block;
          }
          .login-title {
            font-size: 28px;
            font-weight: 700;
            color: #111827;
            margin: 0 0 8px 0;
            letter-spacing: -0.5px;
          }
          .login-desc {
            font-size: 15px;
            color: #6B7280;
            margin: 0;
            line-height: 1.5;
          }
          .login-right {
            flex: 1;
            padding: 4rem 3.5rem;
            display: flex;
            flex-direction: column;
            justify-content: center;
            background: #ffffff;
          }

          /* Mobile Responsive Adjustments */
          @media (max-width: 768px) {
            .login-wrapper {
              padding: 1rem;
            }
            .login-card {
              flex-direction: column;
              min-height: auto;
            }
            .login-left {
              padding: 2.5rem 1.5rem;
              border-right: none;
              border-bottom: 1px solid rgba(0,0,0,0.05);
            }
            .login-logo-box {
              padding: 1rem;
              margin-bottom: 0; /* Removed bottom margin since text is hidden */
            }
            .login-logo {
              width: 200px; /* Smaller logo for mobile */
            }
            
            /* Hides the title and description on mobile */
            .login-text-container {
              display: none; 
            }
            
            .login-title {
              font-size: 22px;
            }
            .login-desc {
              font-size: 14px;
            }
            .login-right {
              padding: 2.5rem 1.5rem;
            }
          }
        `}
      </style>

      <div className="login-wrapper">
        <div className="login-card">
          
          {/* Left Column: Branding & Logo */}
          <div className="login-left">
            <div className="login-logo-box">
              <img 
                src="../../public/Logo_Header.png" 
                alt="Anant Automobiles" 
                className="login-logo"
              />
            </div>
            
            <div className="login-text-container" style={{ textAlign: 'center' }}>
              <h1 className="login-title">
                Anant Automobiles Management Portal
              </h1>
              <p className="login-desc">
                Secure management system for <br/> automobile administration.
              </p>
            </div>
          </div>

          {/* Right Column: Login Form */}
          <div className="login-right">
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
    </>
  );
}