import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/ApiAuthContext';

const HomeRedirect = () => {
  const { user, hasPermission } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (hasPermission('all')) {
    return <Navigate to="/dashboard" replace />;
  }
  if (hasPermission('production-dashboard')) {
    return <Navigate to="/production-dashboard" replace />;
  }
  if (hasPermission('processing-dashboard')) {
    return <Navigate to="/processing-dashboard" replace />;
  }

  return <Navigate to="/profile" replace />;
};

export default HomeRedirect;