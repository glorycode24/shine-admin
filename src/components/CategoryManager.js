// src/components/CategoryManager.js --- DYNAMIC VERSION ---

import React, { useState, useEffect } from 'react';

function CategoryManager() {
  // State to hold the list of categories from the backend
  const [categories, setCategories] = useState([]);
  // State for the new category name input field
  const [name, setName] = useState('');
  // State to show a success or error message to the user
  const [message, setMessage] = useState('');

  // --- Function to fetch all categories from the backend ---
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setMessage('Failed to load categories.');
    }
  };

  // --- Use useEffect to run fetchCategories() when the component loads ---
  useEffect(() => {
    fetchCategories();
  }, []); // The empty array means this runs only once on mount

  // --- Function to handle the form submission ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); // Clear any previous messages

    try {
      // --- This is the POST request ---
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ categoryName: name }), // Send the name in the request body
      });

      if (!response.ok) {
        // Handle cases where the backend returns an error (e.g., duplicate category)
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to create category');
      }

      // If successful:
      setMessage(`Category "${name}" created successfully!`);
      setName(''); // Clear the input field
      fetchCategories(); // Re-fetch the list to show the new category instantly

    } catch (error) {
      console.error('Error creating category:', error);
      setMessage(error.message);
    }
  };

  return (
    <div className="manager-section">
      <h2>Manage Categories</h2>

      {/* Form for adding a new category */}
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

      {/* Display success or error messages here */}
      {message && <p className="message">{message}</p>}

      {/* List of existing categories */}
      <ul className="item-list">
        {categories.map(category => (
          <li key={category.categoryId}>
            <span>{category.name} (ID: {category.categoryId})</span>
            {/* We will add Edit/Delete buttons here later */}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CategoryManager;