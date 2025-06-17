import React, { useState, useEffect } from 'react';

function ProductManager() {
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState('');

  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch {
      setMessage('Failed to load categories.');
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
    } catch {
      setMessage('Failed to load products.');
    }
  };

  const resetForm = () => {
    setProductName('');
    setDescription('');
    setPrice('');
    setStockQuantity('');
    setCategoryId('');
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const productData = {
      productName,
      description,
      price,
      stockQuantity,
      category: { categoryId },
    };

    try {
      const response = await fetch(editId ? `/api/products/${editId}` : '/api/products', {
        method: editId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      if (!response.ok) throw new Error('Failed to save product.');

      setMessage(editId ? 'Product updated successfully!' : 'Product created successfully!');
      resetForm();
      fetchProducts();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleEdit = (product) => {
    setEditId(product.productId);
    setProductName(product.productName);
    setDescription(product.description);
    setPrice(product.price);
    setStockQuantity(product.stockQuantity);
    setCategoryId(product.category.categoryId);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const response = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete product.');
      setMessage('Product deleted.');
      fetchProducts();
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="manager-section">
      <h2>{editId ? 'Edit Product' : 'Manage Products'}</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Product Name"
          value={productName}
          onChange={e => setProductName(e.target.value)}
          required
        />
        <textarea
          placeholder="Description"
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
              {cat.categoryName} (ID: {cat.categoryId})
            </option>
          ))}
        </select>
        <button type="submit">{editId ? 'Update Product' : 'Add Product'}</button>
        {editId && <button onClick={resetForm} type="button">Cancel</button>}
      </form>

      {message && <p className="message">{message}</p>}

      <h3>Existing Products</h3>
      <ul className="item-list">
        {products.map(prod => (
          <li key={prod.productId}>
            <strong>{prod.productName}</strong> – {prod.description}<br />
            Price: ₱{prod.price}, Stock: {prod.stockQuantity}<br />
            Category: {prod.category?.categoryName} (ID: {prod.category?.categoryId})<br />
            <button onClick={() => handleEdit(prod)}>Edit</button>
            <button onClick={() => handleDelete(prod.productId)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProductManager;
