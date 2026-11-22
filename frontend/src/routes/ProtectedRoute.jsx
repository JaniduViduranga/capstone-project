import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Protects routes based on required user roles.
 * Allowed roles: 'student', 'verifier', 'admin'
 */
export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If specific roles are required, ensure current user has the correct role
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // Redirect to their respective authorized area
    if (role === 'admin') return <Navigate to="/admin" replace />;
    if (role === 'verifier') return <Navigate to="/verifier" replace />;
    if (role === 'student') return <Navigate to="/student" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
};

/**
 * Routes that should only be accessible to non-authenticated users (e.g. Login, Register).
 * If user is already authenticated, redirect them to their role's dashboard.
 */
export const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, role } = useAuth();

  if (isAuthenticated) {
    if (role === 'admin') return <Navigate to="/admin" replace />;
    if (role === 'verifier') return <Navigate to="/verifier" replace />;
    if (role === 'student') return <Navigate to="/student" replace />;
  }

  return children;
};

export default ProtectedRoute;
