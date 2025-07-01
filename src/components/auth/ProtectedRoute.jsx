import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/ApiAuthContext';

const ProtectedRoute = ({ permissions, children }) => {
  const { isAuthenticated, isLoading, hasPermission, user } = useAuth();

  if (isLoading) return null; // or a spinner

  if (!isAuthenticated) return <Navigate to="/login" />;
  
  // Special case: if user is admin, allow access to all routes
  if (user?.role === 'admin' || user?.username === 'admin') {
    console.log('Admin user bypass for protected route');
    return children;
  }
  
  // If permissions is an array, check if user has any of them
  if (permissions) {
    const permissionsArray = Array.isArray(permissions) ? permissions : [permissions];
    const hasRequiredPermission = permissionsArray.some(permission => hasPermission(permission));
    
    console.log('ProtectedRoute check:', {
      requiredPermissions: permissionsArray,
      userPermissions: user?.department?.permissions,
      userRole: user?.role,
      username: user?.username,
      hasRequiredPermission
    });
    
    if (!hasRequiredPermission) {
      console.log('Access denied, redirecting to profile');
      return <Navigate to="/profile" />;
    }
  }

  return children;
};

export default ProtectedRoute;