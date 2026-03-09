import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const { 
    user,
    loading,
    initialLoading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuthStatus
  } = context;

  const getDisplayName = () => {
    if (user?.fullname) return user.fullname;
    if (user?.username) return user.username;
    if (user?.email) return user.email;
    if (user?.login) return user.login;
    return 'User';
  };

  const getUsername = () => {
    return user?.username || '';
  };

  const getEmail = () => {
    return user?.email || '';
  };

  const getUserId = () => {
    return user?.userId || '';
  };

  const getRole = () => {
    return user?.role || 'USER';
  };

  const isAdmin = () => {
    return user?.role === 'ADMIN';
  };

  return {
    // State
    user,
    loading,
    initialLoading,
    error,
    isAuthenticated,
    
    // Actions
    login,
    register,
    logout,
    checkAuthStatus,
    
    // Helper functions
    getDisplayName,
    getUsername,
    getEmail,
    getUserId,
    getRole,
    isAdmin
  };
};