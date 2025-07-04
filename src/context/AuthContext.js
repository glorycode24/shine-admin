import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api'; // Make sure you have a central api.js service
import loggingService from '../services/loggingService';

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
            // Store user info in localStorage for logging service
            localStorage.setItem('admin_user', JSON.stringify(response.data));
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

  const login = async (newToken) => {
    localStorage.setItem('admin_jwt_token', newToken);
    setToken(newToken);
    
    // Log the login activity after a short delay to ensure user data is available
    setTimeout(async () => {
      try {
        const decoded = jwtDecode(newToken);
        await loggingService.logLogin(decoded.email || 'Unknown');
      } catch (error) {
        console.error('Failed to log login activity:', error);
      }
    }, 1000); // 1 second delay
  };

  const logout = async () => {
    // Log the logout activity before clearing data
    try {
      const user = JSON.parse(localStorage.getItem('admin_user') || '{}');
      if (user.email) {
        await loggingService.logLogout(user.email);
      }
    } catch (error) {
      console.error('Failed to log logout activity:', error);
    }
    
    localStorage.removeItem('admin_jwt_token');
    localStorage.removeItem('admin_user');
    setCurrentUser(null);
    setToken(null);
  };

  const value = { currentUser, login, logout, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}