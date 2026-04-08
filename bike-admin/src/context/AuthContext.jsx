import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem('bs_token') || '');
  const [user, setUser]   = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('bs_user') || 'null'); }
    catch { return null; }
  });

  const login = (t, u) => {
    setToken(t); setUser(u);
    sessionStorage.setItem('bs_token', t);
    sessionStorage.setItem('bs_user', JSON.stringify(u));
  };

  const logout = () => {
    setToken(''); setUser(null);
    sessionStorage.removeItem('bs_token');
    sessionStorage.removeItem('bs_user');
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
