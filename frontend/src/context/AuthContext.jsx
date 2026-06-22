import React, { createContext, useCallback, useState } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext();

const readStoredUser = () => {
  try {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      return null;
    }

    return JSON.parse(userStr);
  } catch (error) {
    console.error('Auth storage parse failed:', error);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const initialUser = readStoredUser();
  const [user, setUser] = useState(initialUser);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(initialUser));

  const checkAuthStatus = useCallback(async () => {
    try {
      setInitialLoading(true);
      const userData = readStoredUser();

      if (userData) {
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setInitialLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authService.login(credentials);

      if (response.success) {
        setUser(response.data);
        setIsAuthenticated(true);
        return { success: true, data: response.data };
      }

      setError(response.error);
      return { success: false, error: response.error };
    } catch (err) {
      const errorMessage = err.message || 'Dang nhap that bai';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authService.register(userData);

      if (response.success) {
        return {
          success: true,
          data: response.data,
          message: response.message
        };
      }

      setError(response.error);
      return { success: false, error: response.error };
    } catch (err) {
      const errorMessage = err.message || 'Dang ky that bai';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await authService.getProfile();

      if (response.success) {
        setUser(response.data);
        setIsAuthenticated(true);
        return { success: true, data: response.data };
      }

      setError(response.error);
      return { success: false, error: response.error };
    } catch (error) {
      const errorMessage = error.message || 'Khong the dong bo ho so';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    user,
    loading,
    initialLoading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuthStatus,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
