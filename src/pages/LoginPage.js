import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './AuthPages.css'; // We'll create a shared style file

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

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
      {/* 👇 THIS IS THE MISSING FORM JSX 👇 */}
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
          />
        </div>
        
        <button type="submit" className="auth-button">Sign In</button>
      </form>
    </div>
  );
}

export default LoginPage;