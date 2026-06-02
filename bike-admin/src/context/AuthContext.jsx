import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('bs_token') || '');
  const [user, setUser]   = useState(() => {
    try { return JSON.parse(localStorage.getItem('bs_user') || 'null'); }
    catch { return null; }
  });
  
  // High-availability storage mapping layout for current user permissions array
  const [permissions, setPermissions] = useState(() => {
    try { return JSON.parse(localStorage.getItem('bs_permissions') || '[]'); }
    catch { return []; }
  });

  const login = (t, u) => {
    setToken(t);
    setUser(u);
    
    // Explicitly grab the authorization keys matrix from the logged-in user profile payload
    const userPerms = u?.permissions?.map(p => p.key) || [];
    setPermissions(userPerms);

    localStorage.setItem('bs_token', t);
    localStorage.setItem('bs_user', JSON.stringify(u));
    localStorage.setItem('bs_permissions', JSON.stringify(userPerms));
  };

  const logout = () => {
    setToken('');
    setUser(null);
    setPermissions([]);
    localStorage.removeItem('bs_token');
    localStorage.removeItem('bs_user');
    localStorage.removeItem('bs_permissions');
  };

  // Helper method to look up structural clearances downstream inside layouts on the fly
  const hasModulePermission = (moduleName, actionName = 'view') => {
    // ADMIN bypass authorization fallback check rule logic
    if (user?.role === 'ADMIN' || user?.roles?.some(r => r.name === 'ADMIN')) return true;
    return permissions.includes(`${moduleName}_${actionName}`);
  };

  return (
    <AuthContext.Provider value={{ token, user, permissions, login, logout, hasModulePermission, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);