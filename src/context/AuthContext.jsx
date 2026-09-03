import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('kos_token'));
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!token && !!user;

  // On mount, validate token by calling /auth/me
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('kos_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }
      try {
        const response = await authService.me();
        setUser(response.data.data);
        setToken(storedToken);
      } catch {
        // Token invalid — clear storage
        localStorage.removeItem('kos_token');
        localStorage.removeItem('kos_user');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = useCallback(async (credentials) => {
    const response = await authService.login(credentials);
    const { user: userData, token: userToken } = response.data.data;
    localStorage.setItem('kos_token', userToken);
    localStorage.setItem('kos_user', JSON.stringify(userData));
    setToken(userToken);
    setUser(userData);
    return response;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // ignore errors on logout
    } finally {
      localStorage.removeItem('kos_token');
      localStorage.removeItem('kos_user');
      setToken(null);
      setUser(null);
    }
  }, []);

  const getCurrentUser = useCallback(async () => {
    const response = await authService.me();
    setUser(response.data.data);
    return response.data.data;
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated, login, logout, getCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
