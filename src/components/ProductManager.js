import React, { useState, useEffect } from 'react';
import loggingService from '../services/loggingService';
import api from '../services/api';
import './ProductManager.css';

function ProductManager() {
  // Basic product fields
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [editId, setEditId] = useState(null);

  // Variation management
  const [variations, setVariations] = useState([]);
  const [availableColors, setAvailableColors] = useState(['Red', 'Blue', 'Green', 'Black', 'White', 'Yellow', 'Purple', 'Orange']);
  const [availableSizes, setAvailableSizes] = useState(['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size']);
  const [showVariationForm, setShowVariationForm] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/categories');
      setCategories(response.data);
    } catch (error) {
      setMessage('Failed to load categories.');
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/api/products');
      setProducts(response.data);
    } catch (error) {
      setMessage('Failed to load products.');
    }
  };

  const resetForm = () => {
    setProductName('');
    setDescription('');
    setBasePrice('');
    setCategoryId('');
    setImageFile(null); 
    setEditId(null);
    setImageUrl('');
    setVariations([]);
    setShowVariationForm(false);
  };

  // Variation management functions
  const addVariation = () => {
    const newVariation = {
      id: Date.now(), // temporary ID for frontend
      color: '',
      size: '',
      stockQuantity: 0,
      price: basePrice || 0, // default to base price
      isActive: true
    };
    setVariations([...variations, newVariation]);
  };

  const updateVariation = (id, field, value) => {
    setVariations(variations.map(v => 
      v.id === id ? { ...v, [field]: value } : v
    ));
  };

  const removeVariation = (id) => {
    setVariations(variations.filter(v => v.id !== id));
  };

  const toggleVariationActive = (id) => {
    setVariations(variations.map(v => 
      v.id === id ? { ...v, isActive: !v.isActive } : v
    ));
  };

    const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('Saving...');

    // Validate variations
    if (variations.length === 0) {
      setMessage('Please add at least one variation (color/size combination).');
      return;
    }

    const activeVariations = variations.filter(v => v.isActive);
    if (activeVariations.length === 0) {
      setMessage('Please ensure at least one variation is active.');
      return;
    }

    // Validate variation data
    for (let variation of activeVariations) {
      if (!variation.color || !variation.size) {
        setMessage('All active variations must have both color and size.');
        return;
      }
      if (variation.stockQuantity < 0) {
        setMessage('Stock quantity cannot be negative.');
        return;
      }
    }

    // Check for duplicate color/size combinations
    const combinations = activeVariations.map(v => `${v.color}-${v.size}`);
    const uniqueCombinations = new Set(combinations);
    if (combinations.length !== uniqueCombinations.size) {
      setMessage('Duplicate color/size combinations are not allowed.');
      return;
    }

    // Upload image if provided
    let finalImageUrl = imageUrl; 
    if (imageFile) {
        setMessage('Uploading image...');
        const formData = new FormData();
        formData.append('file', imageFile);
      formData.append('upload_preset', 'ShineProducts');

        try {
            const cloudinaryResponse = await fetch(
          'https://api.cloudinary.com/v1_1/dzocrzhoh/image/upload',
                {
                    method: 'POST',
                    body: formData,
                }
            );
            
            if (!cloudinaryResponse.ok) {
                throw new Error('Image upload failed. Check Cloudinary settings.');
            }

            const cloudinaryData = await cloudinaryResponse.json();
            finalImageUrl = cloudinaryData.secure_url; 
        } catch (error) {
            setMessage(error.message);
            return; 
        }
    }

    // Calculate total stock for backward compatibility
    const totalStock = activeVariations.reduce((total, v) => total + (parseInt(v.stockQuantity) || 0), 0);
    const averagePrice = activeVariations.reduce((total, v) => total + parseFloat(v.price), 0) / activeVariations.length;

    const productData = {
      productName,
      description,
      basePrice: parseFloat(basePrice),
      category: { categoryId },
      imageUrl: finalImageUrl,
      variations: activeVariations.map(v => ({
        color: v.color,
        size: v.size,
        stockQuantity: parseInt(v.stockQuantity),
        price: parseFloat(v.price)
      }))
    };

    // For backward compatibility, also include the old fields
    const backwardCompatibleData = {
      ...productData,
      price: averagePrice, // Use average price as fallback
      stockQuantity: totalStock // Use total stock as fallback
    };

    try {
      let response;
      if (editId) {
        // Try with variations first
        try {
          response = await api.put(`/api/products/${editId}`, productData);
        } catch (variationError) {
          // If variations fail, try backward compatible format
          response = await api.put(`/api/products/${editId}`, backwardCompatibleData);
        }
      } else {
        // Try with variations first
        try {
          response = await api.post('/api/products', productData);
        } catch (variationError) {
          // If variations fail, try backward compatible format
          response = await api.post('/api/products', backwardCompatibleData);
        }
      }

      // Log the activity
      if (editId) {
        await loggingService.logProductUpdated(productName, editId);
        setMessage('Product updated successfully!');
      } else {
        await loggingService.logProductCreated(productName, response.data.productId || 'Unknown');
        setMessage('Product created successfully!');
      }
      
      resetForm();
      fetchProducts();
    } catch (error) {
      if (error.response?.status === 403) {
        setMessage('Access denied. Please check your authentication or contact your administrator.');
      } else if (error.response?.status === 400) {
        setMessage(`Validation error: ${error.response.data?.message || 'Invalid data'}`);
      } else if (error.response?.status === 500) {
        setMessage('Server error. Please try again later.');
      } else {
        setMessage(`Error: ${error.response?.data?.message || error.message || 'Failed to save product.'}`);
      }
    }
  };

  const handleEdit = (product) => {
    setEditId(product.productId);
    setProductName(product.productName);
    setDescription(product.description);
    setBasePrice(product.basePrice || product.price || '');
    setCategoryId(product.category.categoryId);
    setImageUrl(product.imageUrl || '');
    setImageFile(null);
    
    // Load variations if they exist
    if (product.variations && product.variations.length > 0) {
      setVariations(product.variations.map(v => ({
        id: Date.now() + Math.random(), // temporary ID
        color: v.color,
        size: v.size,
        stockQuantity: v.stockQuantity,
        price: v.price,
        isActive: true
      })));
    } else {
      setVariations([]);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    const productToDelete = products.find(p => p.productId === id);
    const productName = productToDelete ? productToDelete.productName : 'Unknown';
    
    try {
      await api.delete(`/api/products/${id}`);
      await loggingService.logProductDeleted(productName, id);
      setMessage('Product deleted.');
      fetchProducts();
    } catch (error) {
      setMessage(`Error: ${error.response?.data?.message || error.message || 'Failed to delete product.'}`);
    }
  };

  const getTotalStock = () => {
    return variations
      .filter(v => v.isActive)
      .reduce((total, v) => total + (parseInt(v.stockQuantity) || 0), 0);
  };

  return (
    <div className="manager-section">
      <h2>{editId ? 'Edit Product' : 'Add New Product'}</h2>

      <form onSubmit={handleSubmit} className="product-form">
        {/* Basic Product Information */}
        <div className="form-section">
          <h3>Basic Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Product Name *</label>
        <input
          type="text"
                placeholder="Enter product name"
          value={productName}
          onChange={e => setProductName(e.target.value)}
          required
        />
            </div>
            <div className="form-group">
              <label>Base Price *</label>
        <input
          type="number"
                placeholder="0.00"
                value={basePrice}
                onChange={e => setBasePrice(e.target.value)}
          required
          step="0.01"
                min="0"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Description *</label>
            <textarea
              placeholder="Enter product description"
              value={description}
              onChange={e => setDescription(e.target.value)}
          required
              rows="3"
        />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category *</label>
        <select
          value={categoryId}
          onChange={e => setCategoryId(e.target.value)}
          required
        >
          <option value="" disabled>Select a category</option>
          {categories.map(cat => (
            <option key={cat.categoryId} value={cat.categoryId}>
                    {cat.categoryName}
            </option>
          ))}
        </select>
            </div>
            <div className="form-group">
              <label>Product Image</label>
<input
  type="file" 
                accept="image/png, image/jpeg, image/jpg"
                onChange={e => setImageFile(e.target.files[0])}
              />
            </div>
          </div>
        </div>

        {/* Variations Section */}
        <div className="form-section">
          <div className="section-header">
            <h3>Product Variations</h3>
            <button 
              type="button" 
              onClick={addVariation}
              className="add-variation-btn"
            >
              + Add Variation
            </button>
          </div>
          
          <p className="section-description">
            Add different color and size combinations with their individual stock levels and pricing.
          </p>

          {variations.length > 0 && (
            <div className="variations-table-container">
              <table className="variations-table">
                <thead>
                  <tr>
                    <th>Active</th>
                    <th>Color *</th>
                    <th>Size *</th>
                    <th>Stock *</th>
                    <th>Price</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {variations.map((variation, index) => (
                    <tr key={variation.id} className={!variation.isActive ? 'inactive' : ''}>
                      <td>
                        <input
                          type="checkbox"
                          checked={variation.isActive}
                          onChange={() => toggleVariationActive(variation.id)}
                        />
                      </td>
                      <td>
                        <select
                          value={variation.color}
                          onChange={(e) => updateVariation(variation.id, 'color', e.target.value)}
                          disabled={!variation.isActive}
                        >
                          <option value="">Select Color</option>
                          {availableColors.map(color => (
                            <option key={color} value={color}>{color}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <select
                          value={variation.size}
                          onChange={(e) => updateVariation(variation.id, 'size', e.target.value)}
                          disabled={!variation.isActive}
                        >
                          <option value="">Select Size</option>
                          {availableSizes.map(size => (
                            <option key={size} value={size}>{size}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          type="number"
                          value={variation.stockQuantity}
                          onChange={(e) => updateVariation(variation.id, 'stockQuantity', e.target.value)}
                          min="0"
                          disabled={!variation.isActive}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={variation.price}
                          onChange={(e) => updateVariation(variation.id, 'price', e.target.value)}
                          step="0.01"
                          min="0"
                          disabled={!variation.isActive}
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => removeVariation(variation.id)}
                          className="remove-btn"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {variations.length > 0 && (
                <div className="variations-summary">
                  <p>Total Active Variations: {variations.filter(v => v.isActive).length}</p>
                  <p>Total Stock: {getTotalStock()} units</p>
                </div>
              )}
            </div>
          )}

          {variations.length === 0 && (
            <div className="no-variations">
              <p>No variations added yet. Click "Add Variation" to get started.</p>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button type="submit" className="submit-btn">
            {editId ? 'Update Product' : 'Create Product'}
          </button>
          {editId && (
            <button type="button" onClick={resetForm} className="cancel-btn">
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      {message && <p className="message">{message}</p>}

      {/* Existing Products List */}
      <div className="existing-products">
      <h3>Existing Products</h3>
        <div className="products-grid">
        {products.map(prod => (
            <div key={prod.productId} className="product-card">
              <div className="product-image">
                {prod.imageUrl ? (
                  <img src={prod.imageUrl} alt={prod.productName} />
                ) : (
                  <div className="no-image">No Image</div>
                )}
              </div>
              <div className="product-info">
                <h4>{prod.productName}</h4>
                <p className="description">{prod.description}</p>
                <p className="price">Base Price: ₱{prod.basePrice || prod.price}</p>
                <p className="category">Category: {prod.category?.categoryName}</p>
                {prod.variations && prod.variations.length > 0 && (
                  <p className="variations-count">
                    {prod.variations.length} variation{prod.variations.length !== 1 ? 's' : ''}
                  </p>
                )}
                <div className="product-actions">
                  <button onClick={() => handleEdit(prod)} className="edit-btn">Edit</button>
                  <button onClick={() => handleDelete(prod.productId)} className="delete-btn">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProductManager;
