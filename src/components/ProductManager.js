// src/components/ProductManager.js --- DYNAMIC VERSION (Part 1) ---

import React, { useState, useEffect } from 'react';

function ProductManager() {
  // --- State for the form inputs ---
  const [imageFile, setImageFile] = useState(null);
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [categoryId, setCategoryId] = useState('');

  // --- State for the category dropdown and messages ---
  const [categories, setCategories] =useState([]);
  const [message, setMessage] = useState('');

  // --- Fetch categories when the component loads ---
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) throw new Error('Could not fetch categories');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        setMessage(error.message);
      }
    };
    fetchCategories();
  }, []);

  // --- Handle form submission ---
  const handleSubmit = async (e) => {
  e.preventDefault();
  setMessage('');

  if (!categoryId) return setMessage('Please select a category.');
  if (!imageFile) return setMessage('Please select a product image.');

  // --- Create FormData to handle file upload ---
  const formData = new FormData();
  formData.append('productName', productName);
  formData.append('description', description);
  formData.append('price', price);
  formData.append('stockQuantity', stockQuantity);
  formData.append('categoryId', categoryId);
  formData.append('image', imageFile); // 'image' must match the @RequestParam in the backend

  try {
    // We no longer use 'Content-Type': 'application/json'
    // The browser will automatically set the correct 'multipart/form-data' header
    const response = await fetch('/api/products', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to create product.');
    }

    setMessage(`Product "${productName}" created successfully!`);
    // Clear the form
    setProductName('');
    setDescription('');
    setPrice('');
    setStockQuantity('');
    setCategoryId('');
    setImageFile(null);
    document.getElementById('imageUpload').value = null; // Reset file input

  } catch (error) {
    setMessage(error.message);
  }
};

  return (
    <div className="manager-section">
      <h2>Manage Products</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Product Name"
          value={productName}
          onChange={e => setProductName(e.target.value)}
          required
        />
        <textarea
          placeholder="Product Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
        ></textarea>
        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={e => setPrice(e.target.value)}
          required
          step="0.01"
        />
        <input
          type="number"
          placeholder="Stock Quantity"
          value={stockQuantity}
          onChange={e => setStockQuantity(e.target.value)}
          required
        />
        <select
          value={categoryId}
          onChange={e => setCategoryId(e.target.value)}
          required
        >
          <option value="" disabled>Select a category</option>
          {categories.map(cat => (
            <option key={cat.categoryId} value={cat.categoryId}>
              {cat.name}
              
            </option>
          ))}
        </select>
        {/* Image input will go here */}
        <button type="submit">Add Product</button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default ProductManager;