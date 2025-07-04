import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import api from '../services/api';
import './AuthPages.css'; // We'll create a shared style file

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, currentUser, loading } = useAuth();

  if (loading) {
    return <div style={{textAlign: 'center', marginTop: '2rem'}}>Checking authentication...</div>;
  }

  if (currentUser) {
    // Already logged in, redirect to main page
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('/api/auth/login', { email, password });
      login(response.data.token);
      navigate('/'); // Redirect to the admin dashboard on success
    } catch (err) {
      setError('Invalid credentials or not an admin.');
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Admin Panel Sign In</h2>
        {error && <p className="auth-error">{error}</p>}
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            disabled={loading}
          />
        </div>
        
        <button type="submit" className="auth-button" disabled={loading}>Sign In</button>
      </form>
    </div>
  );
}

export default LoginPage;