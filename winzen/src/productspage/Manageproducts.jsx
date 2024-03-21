import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get } from 'firebase/database';
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

const ManageProducts = () => {
  const [categories, setCategories] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedTemperature, setSelectedTemperature] = useState('hot');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  const loadCategories = () => {
    const db = getDatabase();
    const categoriesRef = ref(db, 'categories');
    get(categoriesRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const categoriesData = snapshot.val();
          const categoriesArray = Object.values(categoriesData);
          setCategories(categoriesArray);
        }
      })
      .catch((error) => {
        console.error('Error loading categories:', error);
      });
  };

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

  const showProductDetails = (product) => {
    setSelectedProduct(product);
  };

  const hideProductDetails = () => {
    setSelectedProduct(null);
  };

  const handleTemperatureChange = (temperature) => {
    setSelectedTemperature(temperature);
    setSelectedSize('');
  };

  const handleSizeClick = (size) => {
    setSelectedSize(size);
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
  };

  const filteredProducts = selectedCategory === 'All' ? products : products.filter(product => product.Category === selectedCategory);

  return (
    <div className="flex-1 bg-gradient-to-t to-gray-400 from-white bg-cover bg-center bg-no-repeat h-screen">
      <style>
            {`
              ::-webkit-scrollbar {
                width: 10px;
                height: 5px;
              }

              ::-webkit-scrollbar-track {
                background: transparent;
              }

              ::-webkit-scrollbar-thumb {
                background: linear-gradient(180deg, rgba(165,164,168,1) 0%, rgba(190,190,195,1) 35%, rgba(255,255,255,1) 100%);
                border-radius: 0px;
              }

              ::-webkit-scrollbar-thumb:hover {
                background: #555;
              }
            `}
          </style>
      <div className="p-4">
        <h1 className="text-6xl text-center mt-2 font-bold text-white">Manage Products!</h1>
        <h3 className="text-lg bg-teal-800 text-gray-200 text-center mt-4 md:mt-8 font-semibold">Edit Products Only When Necessary</h3>
        <hr className="my-4 border-gray-500 border-2" />
        <div className="flex mt-2 mb-2 overflow-x-auto p-2" style={{ scrollBehavior: 'smooth', background: 'transparent' }}>
        <style>
            {`
              ::-webkit-scrollbar {
                width: 5px;
                height: 5px;
              }

              ::-webkit-scrollbar-track {
                background: transparent;
              }

              ::-webkit-scrollbar-thumb {
                background: #888;
                border-radius: 5px;
              }

              ::-webkit-scrollbar-thumb:hover {
                background: #555;
              }
            `}
          </style>
          <div key={'All'} className="mr-24 mb-4">
            <button onClick={() => handleCategoryFilter('All')} className={`px-4 py-2 text-white text-lg rounded-lg font-bold ${selectedCategory === 'All' ? 'bg-yellow-600' : 'bg-gray-500'}`}>All</button>
          </div>
          {categories.map((category, index) => (
            <div key={index} className="mr-24 mb-4">
              <button onClick={() => handleCategoryFilter(category.Name)} className={`px-4 py-2 text-white text-lg rounded-lg font-bold ${selectedCategory === category.Name ? 'bg-yellow-600' : 'bg-gray-500'}`}>{category.Name}</button>
            </div>
          ))}
        </div>
        {filteredProducts.length > 0 ? (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product, index) => (
                <div key={index} className="rounded-lg border border-gray-500 p-4 mb-4 order-slip-bg cursor-pointer" onClick={() => showProductDetails(product)}>
                  <p className="text-sm md:text-base font-bold">{product.Name}</p>
                  <p className='text-sm md:text-sm'>Price: {product.Variations.temperature.hot ? Object.values(product.Variations.temperature.hot)[0] : ''}</p>
                  <img src={product.imageURL} alt={product.Name} className="w-full h-auto mt-2" />
                </div>
              ))}
            </div>
          ) : (
            <p>No products available</p>
          )}
        {selectedProduct && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
            <div className="bg-white p-8 rounded-lg" style={{ width: '80%', height: '80%' }}>
              <div className="flex justify-between">
                <h2 className="text-3xl font-bold mt-10 text-emerald-900 bg-gray-200 p-2 mb-2 rounded-lg">{selectedProduct.Name}</h2>
                <div>
                  <button className="bg-yellow-600 text-white px-3 py-1 rounded-md mr-2">Edit</button>
                  <button className="bg-red-500 text-white px-3 py-1 rounded-md" onClick={hideProductDetails}>Close</button>
                </div>
              </div>
              <div className="mt-4 flex justify-between">
              <div className="w-1/3">
                {/* Assuming you have a field for image URL in your product data */}
                <img src={selectedProduct.imageURL} alt="Product" className="w-full h-auto" />
              </div>
                <div className="w-2/3">
                  <p className="font-bold">Category: {selectedProduct.Category}</p>
                  <p className="font-semibold mt-2">Price: {selectedProduct.Variations.temperature[selectedTemperature] ? selectedProduct.Variations.temperature[selectedTemperature][selectedSize || Object.keys(selectedProduct.Variations.temperature[selectedTemperature])[0]] : ''}</p>
                  <p>{selectedProduct.description}</p>
                  <div className="mt-10">
                    <button className={`bg-black text-white px-3 py-1 rounded-md mr-2 ${selectedTemperature === 'hot' ? 'opacity-50' : ''}`} onClick={() => handleTemperatureChange('hot')}>Hot</button>
                    <button className={`bg-black text-white px-3 py-1 rounded-md ${selectedTemperature === 'iced' ? 'opacity-50' : ''}`} onClick={() => handleTemperatureChange('iced')}>Iced</button>
                  </div>
                  <div className="mt-10">
                    <p className="font-bold">Sizes:</p>
                    {selectedProduct.Variations.temperature[selectedTemperature] &&
                      Object.keys(selectedProduct.Variations.temperature[selectedTemperature]).map((size, index) => (
                        <div
                          key={index}
                          className={`flex items-center cursor-pointer ${selectedSize === size ? 'text-blue-500' : 'text-gray-500'}`}
                          onClick={() => handleSizeClick(size)}
                        >
                          <div className="w-6 h-6 bg-emerald-700 rounded-full mr-2 mt-2"></div>
                          <p>{size}</p>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageProducts;