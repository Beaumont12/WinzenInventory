import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get, update } from 'firebase/database';
import { initializeApp } from 'firebase/app';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDqmb4K_bAd0ySj3QoEeDVT-N0nCMINVN0",
  authDomain: "wenzinpossystem.firebaseapp.com",
  databaseURL: "https://wenzinpossystem-default-rtdb.firebaseio.com",
  projectId: "wenzinpossystem",
  storageBucket: "wenzinpossystem.appspot.com",
  messagingSenderId: "910317765447",
  appId: "1:910317765447:web:1157c166ae49d0590d4262"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const Addproducts = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [newPrice, setNewPrice] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    const db = getDatabase();
    const productsRef = ref(db, 'products');
    get(productsRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const productsData = snapshot.val();
          const productsArray = Object.keys(productsData).map((key) => ({
            id: key,
            ...productsData[key]
          }));
          setProducts(productsArray);
        }
      })
      .catch((error) => {
        console.error('Error loading products:', error);
      });
  };

  const handleSizeChange = (size) => {
    setSelectedSize(size);
  };

  const handlePriceChange = (price) => {
    setNewPrice(price);
  };

  const handleUpdateProduct = () => {
    if (!selectedProduct || !selectedSize || !newPrice) {
      console.error('Please select a product, size, and enter a price.');
      return;
    }

    const db = getDatabase();
    const productRef = ref(db, `products/${selectedProduct.id}`);
    
    const updates = {
      [`Variations.temperature.hot.${selectedSize}`]: newPrice,
      [`Variations.temperature.iced.${selectedSize}`]: newPrice,
    };

    update(productRef, updates)
      .then(() => {
        console.log('Product updated successfully.');
        // You may want to reload products after updating
        loadProducts();
      })
      .catch((error) => {
        console.error('Error updating product:', error);
      });
  };

  return (
    <div>
      <h1>Manage Products</h1>
      <div>
        <select value={selectedSize} onChange={(e) => handleSizeChange(e.target.value)}>
          {/* Render options for available sizes */}
        </select>
        <input type="text" value={newPrice} onChange={(e) => handlePriceChange(e.target.value)} />
        <button onClick={handleUpdateProduct}>Update Product</button>
      </div>
      <div>
        {/* Render product list */}
      </div>
    </div>
  );
};

export default Addproducts;
