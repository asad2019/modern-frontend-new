
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/ApiAuthContext';

const HomeRedirect = () => {
  const { user, hasPermission, isLoading, permissions } = useAuth();
  const [permissionsReady, setPermissionsReady] = useState(false);

  // Wait for permissions to be loaded
  useEffect(() => {
    if (user && permissions && permissions.length >= 0) {
      // Give a small delay to ensure permissions are fully loaded
      const timer = setTimeout(() => {
        setPermissionsReady(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [user, permissions]);

  if (isLoading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Wait for permissions to be ready
  if (!permissionsReady) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <div className="text-sm text-muted-foreground">Loading permissions...</div>
        </div>
      </div>
    );
  }

  // Debug: Log permissions to check if they're loaded correctly
  console.log('HomeRedirect - User permissions:', permissions);
  console.log('HomeRedirect - User department:', user.department);
  console.log('HomeRedirect - User role/username:', user.role, user.username);
  console.log('HomeRedirect - hasPermission(all):', hasPermission('all'));
  console.log('HomeRedirect - hasPermission(production-dashboard):', hasPermission('production-dashboard'));
  console.log('HomeRedirect - hasPermission(processing-dashboard):', hasPermission('processing-dashboard'));

  // Special case: if user is admin but has no department/permissions, redirect to dashboard
  if (user.role === 'admin' || user.username === 'admin') {
    console.log('Admin user detected, redirecting to /dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  // Check permissions in order of priority with more robust checking
  // First check if permissions array includes 'all' or if user has admin access
  if (permissions.includes('all') || hasPermission('all')) {
    console.log('Redirecting to /dashboard');
    return <Navigate to="/dashboard" replace />;
  }
  
  // Check for production dashboard access
  if (permissions.includes('production-dashboard') || hasPermission('production-dashboard')) {
    console.log('Redirecting to /production-dashboard');
    return <Navigate to="/production-dashboard" replace />;
  }
  
  // Check for processing dashboard access
  if (permissions.includes('processing-dashboard') || hasPermission('processing-dashboard')) {
    console.log('Redirecting to /processing-dashboard');
    return <Navigate to="/processing-dashboard" replace />;
  }

  // If no specific dashboard permissions, redirect to profile
  console.log('No dashboard permissions found, redirecting to /profile');
  return <Navigate to="/profile" replace />;
};

export default HomeRedirect;
