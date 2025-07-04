// File: src/components/ProtectedRoute.js

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { loading } = useAuth();
  const token = localStorage.getItem('admin_jwt_token');

  if (loading) {
    // Optionally, show a spinner or loading message
    return <div style={{textAlign: 'center', marginTop: '2rem'}}>Checking authentication...</div>;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If there is a token, allow access to the nested routes
  // A more advanced version would also re-verify the token with the /users/me endpoint here.
  return <Outlet />;
};

export default ProtectedRoute;