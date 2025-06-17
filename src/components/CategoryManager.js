import React, { useState, useEffect } from 'react';

function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      setMessage('Failed to load categories.');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryName: name }),
      });

      if (!response.ok) throw new Error(await response.text());
      setMessage(`Category "${name}" created successfully!`);
      setName('');
      fetchCategories();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleEdit = (category) => {
    setEditId(category.categoryId);
    setEditName(category.name);
  };

  const handleUpdate = async (id) => {
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryName: editName }),
      });

      if (!response.ok) throw new Error('Failed to update category.');
      setMessage(`Category updated successfully!`);
      setEditId(null);
      fetchCategories();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete category.');
      setMessage('Category deleted.');
      fetchCategories();
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="manager-section">
      <h2>Manage Categories</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category name"
          required
        />
        <button type="submit">Add Category</button>
      </form>

      {message && <p className="message">{message}</p>}

      <ul className="item-list">
        {categories.map((category) => (
          <li key={category.categoryId}>
            {editId === category.categoryId ? (
              <>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
                <button onClick={() => handleUpdate(category.categoryId)}>Save</button>
                <button onClick={() => setEditId(null)}>Cancel</button>
              </>
            ) : (
              <>
                <span>{category.categoryName} (ID: {category.categoryId})</span>
                <button onClick={() => handleEdit(category)}>Edit</button>
                <button onClick={() => handleDelete(category.categoryId)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CategoryManager;
