import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('peelkraft_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAdmin = async () => {
      if (token) {
        try {
          const res = await authApi.getProfile();
          setAdmin(res.data);
        } catch {
          logout();
        }
      }
      setLoading(false);
    };
    loadAdmin();
  }, [token]);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    const { token: newToken, admin: adminData } = res.data;
    localStorage.setItem('peelkraft_token', newToken);
    localStorage.setItem('peelkraft_admin', JSON.stringify(adminData));
    setToken(newToken);
    setAdmin(adminData);
    return adminData;
  };

  const logout = () => {
    localStorage.removeItem('peelkraft_token');
    localStorage.removeItem('peelkraft_admin');
    setToken(null);
    setAdmin(null);
  };

  const isAuthenticated = !!admin && !!token;

  const hasRole = (...roles) => {
    if (!admin) return false;
    return roles.includes(admin.role);
  };

  return (
    <AuthContext.Provider value={{ admin, token, loading, login, logout, isAuthenticated, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};
