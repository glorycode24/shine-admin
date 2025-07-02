import React, { useState, useEffect } from 'react';
import api from '../services/api'; // Your central api service is crucial here
import './UserManager.css'; // Create a new CSS file for styles

function UserManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // The interceptor in api.js will automatically send the admin's JWT
      const response = await api.get('/api/admin/users');
      setUsers(response.data);
    } catch (error) {
      setMessage('Failed to load users. You may not have permission.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (userId, userEmail) => {
    if (!window.confirm(`Are you sure you want to delete user: ${userEmail}?`)) {
      return;
    }
    try {
      await api.delete(`/api/admin/users/${userId}`);
      setMessage('User deleted successfully.');
      // Refresh the list automatically after a successful deletion
      fetchUsers();
    } catch (error) {
      setMessage('Failed to delete user.');
    }
  };

  if (loading) {
    return <h2>Loading customer data...</h2>;
  }

  return (
    <div className="manager-section">
      <h2>Customer Management</h2>
      {message && <p className="message">{message}</p>}
      <table className="user-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.userId}>
              <td>{user.userId}</td>
              <td>{user.firstName}</td>
              <td>{user.lastName}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <button 
                  className="delete-btn"
                  onClick={() => handleDelete(user.userId, user.email)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UserManager;