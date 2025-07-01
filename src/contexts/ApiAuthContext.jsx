
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '@/lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [permissions, setPermissions] = useState([]);
  const checkingAuthRef = useRef(false);

  const checkAuth = useCallback(async () => {
    // Prevent multiple simultaneous auth checks
    if (checkingAuthRef.current) return;
    
    const token = localStorage.getItem('authToken');
    if (!token) {
      setIsLoading(false);
      return;
    }

    checkingAuthRef.current = true;
    
    try {
      const response = await api.get('/auth/me');
      if (response.data.success) {
        const userData = response.data.data;
        setUser(userData);
        setPermissions(userData.department?.permissions || []);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('authToken');
        setUser(null);
        setPermissions([]);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('authToken');
      setUser(null);
      setPermissions([]);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
      checkingAuthRef.current = false;
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success) {
      const { user: userData, token } = response.data.data;
      localStorage.setItem('authToken', token);
      setUser(userData);
      setPermissions(userData.department?.permissions || []);
      setIsAuthenticated(true);
      return userData;
    }
    throw new Error(response.data.error?.message || 'Login failed');
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setPermissions([]);
      localStorage.removeItem('authToken');
    }
  };

  const updateUser = async (profileData) => {
    const { data } = await api.put('/auth/me', profileData);
    if (data.success) {
      setUser(data.data);
      return data.data;
    } else {
      throw new Error(data.error?.message || 'Profile update failed');
    }
  };

  const hasPermission = (requiredPermission) => {
    if (!requiredPermission) return true;
    if (permissions.includes('all')) return true;
    return permissions.includes(requiredPermission);
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    permissions,
    login,
    logout,
    updateUser,
    hasPermission,
    recheckAuth: checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {isLoading ? (
        <div className="min-h-screen w-full flex items-center justify-center bg-background">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <div className="text-lg font-medium">Authenticating...</div>
          </div>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
