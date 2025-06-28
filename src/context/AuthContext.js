import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api'; // Make sure you have a central api.js service

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('admin_jwt_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminProfile = async () => {
      if (token) {
        try {
          const response = await api.get('/api/users/me');
          // IMPORTANT: Check if the user has the ADMIN role
          if (response.data && response.data.role === 'ADMIN') {
            setCurrentUser(response.data);
          } else {
            // If the user is not an admin, log them out of the admin panel
            logout();
          }
        } catch (error) {
          console.error("Failed to fetch admin profile, logging out:", error);
          logout();
        }
      }
      setLoading(false);
    };
    fetchAdminProfile();
  }, [token]);

  const login = (newToken) => {
    localStorage.setItem('admin_jwt_token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('admin_jwt_token');
    setCurrentUser(null);
    setToken(null);
  };

  const value = { currentUser, login, logout, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}