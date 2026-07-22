import { createContext, useContext, useState, useEffect } from 'react';
import { userAuthApi } from '../api';

const UserContext = createContext(null);

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('pk_user_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await userAuthApi.getProfile();
          setUser(res.data.data || res.data);
        } catch {
          logout();
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await userAuthApi.login({ email, password });
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('pk_user_token', newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const register = async (data) => {
    const res = await userAuthApi.register(data);
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('pk_user_token', newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('pk_user_token');
    setToken(null);
    setUser(null);
  };

  const updateUser = (data) => {
    setUser((prev) => ({ ...prev, ...data }));
  };

  const isAuthenticated = !!user && !!token;

  return (
    <UserContext.Provider value={{ user, token, loading, login, register, logout, isAuthenticated, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};
