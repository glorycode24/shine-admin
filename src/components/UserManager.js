import React, { useState, useEffect } from 'react';
import api from '../services/api'; // Your central api service is crucial here
import loggingService from '../services/loggingService';
import './UserManager.css'; // Create a new CSS file for styles

function UserManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

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

  const confirmDelete = (user) => {
    setUserToDelete(user);
    setShowModal(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!userToDelete) return;
    try {
      await api.delete(`/api/admin/users/${userToDelete.userId}`);
      
      // Log the user deletion
      await loggingService.logUserDeleted(userToDelete.email, userToDelete.userId);
      
      setMessage('User deleted successfully.');
      fetchUsers();
    } catch (error) {
      setMessage('Failed to delete user.');
    } finally {
      setShowModal(false);
      setUserToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowModal(false);
    setUserToDelete(null);
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
                  onClick={() => confirmDelete(user)}
                  title="Delete this user"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete user <b>{userToDelete?.email}</b>?</p>
            <div className="modal-actions">
              <button className="modal-btn confirm" onClick={handleDeleteConfirmed}>Yes, Delete</button>
              <button className="modal-btn cancel" onClick={handleCancelDelete}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManager;