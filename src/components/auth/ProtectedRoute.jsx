import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/ApiAuthContext';

const ProtectedRoute = ({ requiredPermission, children }) => {
  const { isAuthenticated, isLoading, hasPermission } = useAuth();

  if (isLoading) return null; // or a spinner

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!hasPermission(requiredPermission)) return <Navigate to="/profile" />;

  return children;
};

export default ProtectedRoute;