import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const clearSession = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const validateSession = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      clearSession();
      setIsInitializing(false);
      return false;
    }

    try {
      const response = await authAPI.getProfile();
      const nextUser = response.data;

      localStorage.setItem('user', JSON.stringify(nextUser));
      setUser(nextUser);
      setIsAuthenticated(true);
      setIsInitializing(false);
      return true;
    } catch (error) {
      clearSession();
      setIsInitializing(false);
      return false;
    }
  };

  useEffect(() => {
    validateSession();
  }, []);

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    clearSession();
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isInitializing,
      login,
      logout,
      validateSession,
    }),
    [user, isAuthenticated, isInitializing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
