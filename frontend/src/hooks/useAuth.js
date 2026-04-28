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
    checkAuthStatus,
    refreshProfile
  } = context;

  // Helper functions
  const getDisplayName = () => {
    if (user?.fullname) return user.fullname;
    if (user?.username) return user.username;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  const getUsername = () => {
    return user?.username || '';
  };

  const getEmail = () => {
    return user?.email || '';
  };

  const getUserId = () => {
    return user?.userId || user?.id || '';
  };

  const getRole = () => {
    return user?.role || 'USER';
  };

  const isAdmin = () => {
    const role = user?.role?.toUpperCase();
    return role === 'ADMIN' || role === 'ROLE_ADMIN';
  };

  const hasRole = (role) => {
    return user?.role?.toUpperCase() === role.toUpperCase();
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
    refreshProfile,
    
    // Helper functions
    getDisplayName,
    getUsername,
    getEmail,
    getUserId,
    getRole,
    isAdmin,
    hasRole
  };
};
