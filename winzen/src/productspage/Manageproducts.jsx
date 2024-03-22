import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get, update, remove } from 'firebase/database';
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
  const [editMode, setEditMode] = useState(false);
  const [newSize, setNewSize] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

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
    setEditMode(false); // Reset edit mode when showing product details
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
    const product = selectedProduct;
    if (
      product &&
      product.Variations &&
      product.Variations.temperature &&
      product.Variations.temperature[selectedTemperature]
    ) {
      // Check if variations exist for the selected temperature
      if (Object.keys(product.Variations.temperature[selectedTemperature]).length === 0) {
        // If no data for the selected temperature, enable the form for adding new size and price
        setEditMode(true);
      }
    } else {
      // If variations do not exist for the selected temperature, enable the form for adding new size and price
      setEditMode(true);
    }
  };
  
  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
  };

  const handleEditMode = () => {
    const product = selectedProduct;
    if (product && product.Variations && product.Variations.temperature) {
      const hasHotData = product.Variations.temperature['hot'] && Object.keys(product.Variations.temperature['hot']).length > 0;
      const hasIcedData = product.Variations.temperature['iced'] && Object.keys(product.Variations.temperature['iced']).length > 0;
      if (hasHotData || hasIcedData) {
        // If either "hot" or "iced" variation has data, enable the form for editing
        setEditMode(true);
      } else {
        // If neither "hot" nor "iced" variation has data, enable the form for adding new size and price
        setEditMode(false); // Disable edit mode
        setSelectedSize(''); // Reset selected size
        setSelectedTemperature('hot'); // Set default temperature to 'hot'
      }
    }
  };

  const updateProduct = (updates) => {
    const db = getDatabase();
    const productRef = ref(db, `products/${selectedProduct.id}/Variations/temperature/${selectedTemperature}`);
  
    // Send updates to the database
    update(productRef, updates)
      .then(() => {
        // Update local state after successful database update
        setProducts((prevProducts) => {
          const updatedProducts = prevProducts.map((product) => {
            if (product.id === selectedProduct.id) {
              // Update the price in the local state
              const updatedVariations = {
                ...product.Variations.temperature[selectedTemperature],
                ...updates
              };
              return {
                ...product,
                Variations: {
                  ...product.Variations,
                  temperature: {
                    ...product.Variations.temperature,
                    [selectedTemperature]: updatedVariations
                  }
                }
              };
            }
            return product;
          });
          return updatedProducts;
        });
  
        // Reset edit mode and clear newSize, newPrice states
        setEditMode(false);
        setNewSize('');
        setNewPrice('');
      })
      .catch((error) => {
        console.error('Error updating product:', error);
      });
  };
  
  const handleUpdateProduct = () => {
    console.log("Selected Size:", newSize);
    console.log("New Price:", newPrice);
    if ((selectedSize || newSize) && newPrice) {
      const updates = {
        [(selectedSize || newSize)]: newPrice
      };
      updateProduct(updates);
    } else {
      console.log("Selected size and new price are required.");
    }
  };
  
  const handleSizeChange = (e) => {
    const newSize = e.target.value;
    console.log('Selected Size:', newSize);
    setNewSize(newSize); // Update newSize state
  };

  const handleAddFormToggle = () => {
    setShowAddForm(!showAddForm);
  };

  const handleDeleteSize = (size) => {
    // Display a confirmation dialog
    const confirmDelete = window.confirm(`Are you sure you want to delete the size '${size}'?`);
    
    // Proceed with deletion if confirmed
    if (confirmDelete) {
      // Remove the size from the selected product's variations in the local state
      setSelectedProduct((prevProduct) => {
        const updatedProduct = { ...prevProduct };
        if (
          updatedProduct &&
          updatedProduct.Variations &&
          updatedProduct.Variations.temperature &&
          updatedProduct.Variations.temperature[selectedTemperature]
        ) {
          delete updatedProduct.Variations.temperature[selectedTemperature][size];
        }
        return updatedProduct;
      });
  
      // Remove the size from the database
      const db = getDatabase();
      const productRef = ref(
        db,
        `products/${selectedProduct.id}/Variations/temperature/${selectedTemperature}/${size}`
      );
  
      // Remove the size from the database
      remove(productRef)
        .then(() => {
          console.log(`Size '${size}' deleted successfully from the database.`);
        })
        .catch((error) => {
          console.error("Error deleting size from the database:", error);
        });
    }
  };

  const deleteProduct = (product) => {
    if (product) {
      const confirmDelete = window.confirm(`Are you sure you want to delete the product '${product.Name}'?`);
      
      if (confirmDelete) {
        const db = getDatabase();
        const productRef = ref(db, `products/${product.id}`);
  
        // Remove the product from the database
        remove(productRef)
          .then(() => {
            console.log(`Product '${product.Name}' deleted successfully from the database.`);
            // Remove the product from the local state
            setProducts((prevProducts) => prevProducts.filter((p) => p.id !== product.id));
            setSelectedProduct(null); // Clear selected product
          })
          .catch((error) => {
            console.error("Error deleting product from the database:", error);
          });
      }
    }
  };  
  
  const filteredProducts =
    selectedCategory === 'All'
      ? products
      : products.filter((product) => product.Category === selectedCategory);

      return (
        <div className="flex-1 bg-gradient-to-t from-white to-gray-400 bg-cover bg-center bg-no-repeat h-screen">
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
            <h1 className="text-6xl text-center mt-2 font-bold text-white">
              Manage Products!
            </h1>
            <h3 className="text-lg bg-teal-800 text-gray-200 text-center mt-4 md:mt-8 font-semibold">
              Edit Products Only When Necessary
            </h3>
            <hr className="my-4 border-gray-500 border-2" />
            <div className="flex mt-2 mb-2 overflow-x-auto p-2" style={{ scrollBehavior: 'smooth', background: 'transparent' }}>
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
              <div key={'All'} className="mr-4 mb-4">
                <button
                  onClick={() => handleCategoryFilter('All')}
                  className={`px-4 py-2 text-white text-lg rounded-lg font-bold ${
                    selectedCategory === 'All' ? 'bg-yellow-600' : 'bg-gray-500'
                  }`}
                >
                  All
                </button>
              </div>
              {categories.map((category, index) => (
                <div key={index} className="mr-4 mb-4">
                  <button
                    onClick={() => handleCategoryFilter(category.Name)}
                    className={`px-4 py-2 text-white text-lg rounded-lg font-bold ${
                      selectedCategory === category.Name
                        ? 'bg-yellow-600'
                        : 'bg-gray-500'
                    }`}
                  >
                    {category.Name}
                  </button>
                </div>
              ))}
            </div>
            {filteredProducts.length > 0 ? (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((product, index) => (
                  <div key={index} className="relative">
                    {/* Product card container */}
                    <div className="rounded-lg border border-gray-500 p-4 mb-4 order-slip-bg cursor-pointer">
                      {/* Product details */}
                      <div onClick={() => showProductDetails(product)}>
                        <p className="text-sm md:text-base font-bold">{product.Name}</p>
                        <p className="text-sm md:text-sm">
                          Price: {product.Variations.temperature[selectedTemperature] ? Object.values(product.Variations.temperature[selectedTemperature])[0] : ''}
                        </p>
                        <img
                          src={product.imageURL}
                          alt={product.Name}
                          className="w-full h-auto mt-2"
                        />
                      </div>
                      {/* Delete button positioned absolute */}
                      <div className="absolute top-1 right-1">
                        <button
                          className="bg-red-500 text-white rounded-full h-8 w-8 flex items-center justify-center"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent the click event from bubbling up to the product container
                            deleteProduct(product);
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No products available</p>
            )}

            {selectedProduct && (
              <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
                <div className="bg-white p-8 rounded-lg overflow-y-auto" style={{ width: '80%', height: '80%' }}>
                  <div className="flex justify-between">
                    <h2 className="text-3xl font-bold mt-10 text-emerald-900 bg-gray-200 p-2 mb-2 rounded-lg">
                      {selectedProduct.Name}
                    </h2>
                    <div>
                      {editMode ? (
                        <button
                          className="bg-green-500 text-white px-3 py-1 rounded-md mr-2"
                          onClick={handleUpdateProduct}
                        >
                          Update
                        </button>
                      ) : (
                        <button
                          className="bg-yellow-600 text-white px-3 py-1 rounded-md mr-2"
                          onClick={handleEditMode}
                        >
                          Edit
                        </button>
                      )}
                      <button
                        className="bg-red-500 text-white px-3 py-1 rounded-md"
                        onClick={hideProductDetails}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between">
                    <div className="w-1/3">
                      <img
                        src={selectedProduct.imageURL}
                        alt="Product"
                        className="w-full h-auto"
                      />
                    </div>
                    <div className="w-2/3">
                      <p className="font-bold">
                        Category: {selectedProduct.Category}
                      </p>
                      <p className="font-semibold mt-2">
                        Price: {' '}
                        {selectedProduct && selectedProduct.Variations && selectedProduct.Variations.temperature && selectedProduct.Variations.temperature[selectedTemperature]
                          ? (
                            selectedProduct.Variations.temperature[selectedTemperature][selectedSize || Object.keys(selectedProduct.Variations.temperature[selectedTemperature])[0]] || ''
                          )
                          : ''}
                      </p>
                      <p>{selectedProduct.description}</p>
                      <div className="mt-10">
                        <button
                          className={`bg-black text-white px-3 py-1 rounded-md mr-2 ${
                            selectedTemperature === 'hot' ? 'opacity-50' : ''
                          }`}
                          onClick={() => handleTemperatureChange('hot')}
                        >
                          Hot
                        </button>
                        <button
                          className={`bg-black text-white px-3 py-1 rounded-md ${
                            selectedTemperature === 'iced' ? 'opacity-50' : ''
                          }`}
                          onClick={() => handleTemperatureChange('iced')}
                        >
                          Iced
                        </button>
                      </div>
                      <div className="mt-10">
                        <p className="font-bold">Sizes:</p>
                        {selectedProduct.Variations.temperature[selectedTemperature] && Object.keys(selectedProduct.Variations.temperature[selectedTemperature]).map((size, index) => (
                          <div
                            key={index}
                            className={`flex items-center justify-between cursor-pointer ${
                              selectedSize === size ? 'text-blue-500' : 'text-gray-500'
                            }`}
                            onClick={() => handleSizeClick(size)}
                          >
                            <div className="flex items-center">
                              <div className="w-6 h-6 bg-emerald-700 rounded-full mr-2 mt-2"></div>
                              <p>{size}</p>
                            </div>
                            {editMode && (
                              <button className="text-white bg-red-600 px-2 rounded-md" onClick={() => handleDeleteSize(size)}>Delete</button>
                            )}
                          </div>
                        ))}
                        {editMode && !showAddForm && (
                          <button className="mt-10 text-white bg-blue-600 px-3 py-2 rounded-md" onClick={handleAddFormToggle}>Add Size</button>
                        )}
                        {editMode && showAddForm && (
                          <div className="flex items-center mt-10">
                            <input
                              type="text"
                              placeholder="New Size"
                              value={newSize}
                              onChange={(e) => setNewSize(e.target.value)}
                              className="mt-1 p-2 block w-1/2 border-black border-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500 mr-4"
                            />
                            <input
                              type="text"
                              placeholder="New Price"
                              value={newPrice}
                              onChange={(e) => setNewPrice(e.target.value)}
                              className="mt-1 p-2 block w-1/2 border-black border-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <button
                              className="text-white ml-2 bg-emerald-600 px-4 rounded-md"
                              onClick={() => {
                                if (newSize && newPrice) {
                                  updateProduct({ [newSize]: newPrice });
                                  setNewSize('');
                                  setNewPrice('');
                                  setShowAddForm(false);
                                }
                              }}
                            >
                              Add
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {editMode && (
                    <div className="mt-10">
                      <label className="font-bold">Select Size:</label>
                      <select
                        value={selectedSize}
                        onChange={(e) => handleSizeChange(e.target.value)} // Use onChange to capture size
                        className="block w-full mt-1 p-2 border-black border-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        {selectedProduct &&
                          selectedProduct.Variations.temperature[selectedTemperature] &&
                          Object.keys(selectedProduct.Variations.temperature[selectedTemperature]).map((size, index) => (
                            <option key={index} value={size}>{size}</option>
                          ))}
                      </select>
                      <label className="font-bold mt-4">New Price:</label>
                      <input
                        type="text"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        className="block w-full mt-1 p-2 border-black border-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <button
                        className="mt-4 text-white bg-blue-600 px-4 py-2 rounded-md"
                        onClick={handleUpdateProduct}
                      >
                        Update Price
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
            </div>
        </div>
      );      
};

export default ManageProducts;