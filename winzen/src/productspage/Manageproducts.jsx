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

// ConfirmationDialog component
const ConfirmationDialog = ({ message, onCancel, onConfirm }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="bg-white p-8 rounded-lg">
        <p className="text-lg font-semibold">{message}</p>
        <div className="mt-4 flex justify-end">
          <button className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center mr-2" onClick={onCancel}>
            Cancel
          </button>
          <button className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded inline-flex items-center" onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const Manageproducts = () => {
  const [categories, setCategories] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedTemperature, setSelectedTemperature] = useState('hot');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [editMode, setEditMode] = useState(false);
  const [newSize, setNewSize] = useState('');
  const [newPrice, setNewPrice] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [editedDescription, setEditedDescription] = useState('');
  const [editedStockStatus, setEditedStockStatus] = useState('');

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
    setSelectedSize(0);
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

  const updateProductDescriptionAndStockStatus = (editedDescription, editedStockStatus) => {

    console.log('Description received:', editedDescription);
    console.log('Stock status received:', editedStockStatus);
    // Validate description
    if (typeof editedDescription !== 'string' || editedDescription.trim() === '') {
        console.error('Description must be a non-empty string.');
        return;
    }

    // Rest of the function remains the same
    const db = getDatabase();
    const productRef = ref(db, `products/${selectedProduct.id}`);

    // Fetch the existing product data
    get(productRef)
        .then((snapshot) => {
            const existingProductData = snapshot.val();

            // Construct the updates object with the edited values
            const updates = {};

            // Check if stockStatus is defined
            if (editedStockStatus !== undefined) {
                updates.stockStatus = editedStockStatus;
            }

            // Check if Description key exists in existing data
            if (existingProductData && existingProductData.Description) {
                // If Description key exists, update its value
                updates.Description = editedDescription;
            } else {
                // If Description key does not exist, add it
                updates.Description = editedDescription;
            }

            // Send updates to the database
            return update(productRef, updates);
        })
        .then(() => {
            // Update local state after successful database update
            setProducts((prevProducts) => {
                const updatedProducts = prevProducts.map((product) => {
                    if (product.id === selectedProduct.id) {
                        // Update the description and stock status in the local state
                        return {
                            ...product,
                            Description: editedDescription,
                            stockStatus: editedStockStatus
                        };
                    }
                    return product;
                });
                return updatedProducts;
            });

            // Reset edit mode and clear description and stock status states
            setEditMode(false);
            setEditedDescription('');
            setEditedStockStatus('');
            setShowConfirmation(false); // Hide the confirmation dialog after updating
        })
        .catch((error) => {
            console.error('Error updating product:', error);
        });
  };

  const handleUpdateProductDes = () => {
    setConfirmationMessage("Are you sure you want to update the product?");
    setConfirmationCallback(() => () => updateProductDescriptionAndStockStatus(editedDescription, editedStockStatus)); // Include parameters
    setShowConfirmation(true);
  };

  const updateProduct = (updates) => {
    const db = getDatabase();
    const productRef = ref(db, `products/${selectedProduct.id}/Variations/temperature/${selectedTemperature}`);
  
    // Parse price values as integers
    const parsedUpdates = {};
    for (const [key, value] of Object.entries(updates)) {
      parsedUpdates[key] = parseInt(value);
    }
  
    // Send updates to the database
    update(productRef, parsedUpdates)
      .then(() => {
        // Update local state after successful database update
        setProducts((prevProducts) => {
          const updatedProducts = prevProducts.map((product) => {
            if (product.id === selectedProduct.id) {
              // Update the price in the local state
              const updatedVariations = {
                ...product.Variations.temperature[selectedTemperature],
                ...parsedUpdates
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
        setShowConfirmation(false); // Hide the confirmation dialog after updating
      })
      .catch((error) => {
        console.error('Error updating product:', error);
      });
  };  
  
  const handleUpdateProduct = () => {
    setConfirmationMessage("Are you sure you want to update the product?")
    setConfirmationCallback(() => () => confirmUpdate())
    setShowConfirmation(true);
  };
  
  const confirmUpdate = () => {
    // Parse the new price as an integer
    const parsedNewPrice = parseInt(newPrice);
  
    // Check if the parsed price is a valid number
    if (!isNaN(parsedNewPrice)) {
      // Check if either selectedSize or newSize is provided
      if (selectedSize || newSize) {
        // Ensure that the price is stored as an integer
        const updates = {
          [selectedSize || newSize]: parsedNewPrice
        };
        updateProduct(updates);
      } else {
        console.log("Selected size is required.");
      }
    } else {
      console.log("Invalid price. Please enter a valid number.");
    }
  };

  const handleSizeChange = (e) => {
    const newSize = e.target.value;
    setNewSize(newSize); // Update newSize state
    setSelectedSize(newSize);
  };

  const handleAddFormToggle = () => {
    setShowAddForm(!showAddForm);
    setNewPrice('');
  };

  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [confirmationCallback, setConfirmationCallback] = useState(null);

  // Function to handle size deletion
  const handleDeleteSize = (size) => {
    setConfirmationMessage(`Are you sure you want to delete the size '${size}'?`);
    setConfirmationCallback(() => () => confirmDeleteSize(size));
    setShowConfirmation(true);
  };

  // Function to confirm size deletion
  const confirmDeleteSize = (size) => {
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
  };

  // Function to handle product deletion
  const handleDeleteProduct = (product) => {
    setConfirmationMessage(`Are you sure you want to delete the product '${product.Name}'?`);
    setConfirmationCallback(() => () => confirmDeleteProduct(product));
    setShowConfirmation(true);
  };
  
  const cancelUpdate = () => {
    setEditMode(false);
  };

  // Function to confirm product deletion
  const confirmDeleteProduct = (product) => {
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
  };

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value); // Update search query state
  };

  const filteredProducts = products.filter((product) => {
    const categoryMatch = selectedCategory === 'All' || product.Category === selectedCategory;
    const searchMatch = product.Name.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && searchMatch;
  });
  
  return (
    <div className="flex-1 bg-white bg-cover bg-center bg-no-repeat h-screen">
      <style>
        {`
          /* Custom scrollbar */
          ::-webkit-scrollbar {
            width: 5px;
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
        <h1 className="text-6xl text-center mt-2 font-bold text-black">
          Manage Products
        </h1>
        <h3 className="text-lg md:text-base bg-teal-800 text-gray-200 text-center mt-4 md:mt-8 font-semibold">
          EDIT PRODUCTS ONLY WHEN NECESSARY
        </h3>
        <hr className="my-4 border-gray-500 border-2" />
        <input
          type="text"
          placeholder="Search products by name"
          value={searchQuery}
          onChange={handleSearchInputChange}
          className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 mb-4"
        />
        <hr className="my-4 border-gray-500 border-2" />
        <div className="flex mt-2 mb-2 overflow-x-auto p-2" style={{ scrollBehavior: 'smooth', background: 'transparent' }}>
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
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product, index) => (
              <div key={index} className="relative">
                {/* Product card container */}
                <div className="rounded-lg bg-gray-100 border border-gray-300 p-4 mb-4 shadow-gray-300 shadow-lg order-slip-bg cursor-pointer">
                  {/* Product details */}
                  <div onClick={() => showProductDetails(product)}>
                    <p className="text-sm md:text-base font-bold"><strong>{product.Name}</strong></p>
                    <p className="text-sm md:text-sm">
                      Price: {product.Variations.temperature[selectedTemperature] ? Object.values(product.Variations.temperature[selectedTemperature])[0] : ''}
                    </p> <p className="font-semibold mt-2">
                      Stock Status:{" "}
                    <span
                      className={`${
                        product.stockStatus === "Out of Stock"
                          ? "text-red-500"
                          : "text-green-500"
                      }`}
                    >
                      {product.stockStatus}
                    </span>
                  </p>
                  <p className="font-semibold mt-2 text-xs border border-gray-200 rounded-lg p-2 bg-emerald-100">
                    Description: {product.Description}
                  </p>
                    <img
                      src={product.imageURL}
                      alt={product.Name}
                      className="w-full h-auto mt-2 rounded-lg"
                    />
                  </div>
                  {/* Delete button positioned absolute */}
                  <div className="absolute top-1 right-1">
                    <button
                      className="bg-red-500 text-white rounded-full h-8 w-8 flex items-center justify-center"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent the click event from bubbling up to the product container
                        handleDeleteProduct(product);
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
            <div className="bg-gray-100 p-8 rounded-lg overflow-y-auto" style={{ width: '70%', height: '80%' }}>
              <div className="flex justify-between m-4">
                <h2 className="text-3xl font-extrabold mt-10 mx-6 text-white bg-gray-700 p-2 mb-2 rounded-lg">
                  {selectedProduct.Name}
                </h2>
                <div>
                  {editMode ? (
                    <button
                    className="bg-yellow-600 text-white px-3 py-1 rounded-md mr-2"
                    onClick={cancelUpdate}
                  >
                    Cancel
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
              <div className="mt-4 flex justify-between m-10">
                <div className="w-1/3 mr-4">
                  <img
                    src={selectedProduct.imageURL}
                    alt="Product"
                    className="w-full h-auto rounded-lg"
                  />
                </div>
                <div className="w-2/3 mx-10">
                  <p className="font-semibold">
                    <strong>Category:</strong> {selectedProduct.Category}
                  </p>
              
                  <p className="font-semibold mt-2">
                    <strong>Price:</strong> {' '}
                    {selectedProduct && selectedProduct.Variations && selectedProduct.Variations.temperature && selectedProduct.Variations.temperature[selectedTemperature]
                      ? (
                        selectedProduct.Variations.temperature[selectedTemperature][selectedSize || Object.keys(selectedProduct.Variations.temperature[selectedTemperature])[0]] || ''
                      )
                      : ''}
                  </p>
                  <p>{selectedProduct.description}</p>
                  <div>
                    <p className="font-semibold mt-2">
                      <strong>Stock Status:</strong>{" "}
                      {editMode ? (
                        <select
                          value={editedStockStatus || (selectedProduct && selectedProduct.stockStatus) || ''}
                          onChange={(e) => setEditedStockStatus(e.target.value)}
                          className="mt-1 p-2 border-black border-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="In Stock">In Stock</option>
                          <option value="Out of Stock">Out of Stock</option>
                        </select>
                      ) : (
                        selectedProduct && selectedProduct.stockStatus || ''
                      )}
                    </p>
                    <p className="font-semibold mt-2 border border-gray-200 rounded-lg p-2 bg-emerald-200">
                      <strong>Description:</strong> 
                      {editMode ? (
                        <textarea
                          value={editedDescription || (selectedProduct && selectedProduct.Description) || ''}
                          onChange={(e) => setEditedDescription(e.target.value)}
                          className="mt-1 p-2 block w-full border-black border-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      ) : (
                        selectedProduct && selectedProduct.Description || ''
                      )}
                    </p>
                    {editMode && (
                    <button onClick={handleUpdateProductDes} className="mt-2 p-2 bg-blue-500 text-white rounded-md">Submit Changes</button>
                    )}
                  </div>
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
                          <button
                            className="text-white bg-red-600 px-2 rounded-md"
                            onClick={() => {
                              if (Object.keys(selectedProduct.Variations.temperature[selectedTemperature]).length > 1) {
                                handleDeleteSize(size);
                              } else {
                                console.log("Cannot delete the only available size.");
                              }
                            }}
                            disabled={Object.keys(selectedProduct.Variations.temperature[selectedTemperature]).length === 1}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    ))}
                    {editMode && !showAddForm && (
                      <button className="mt-10 text-white bg-blue-600 px-3 py-2 rounded-md" onClick={handleAddFormToggle}>Add Size</button>
                    )}
                    {editMode && showAddForm && (
                      <div className="flex items-center mt-10 ">
                        <input
                          type="text"
                          placeholder="New Size"
                          value={newSize}
                          onChange={(e) => setNewSize(e.target.value)}
                          className="mt-1 p-2 block w-1/2 border-black border-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500 mr-4"
                        />
                        <input
                          type="number"
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
                              setNewPrice(0);
                              setShowAddForm(false);
                            }
                          }}
                        >
                          Add
                        </button>
                      </div>
                    )}
                  </div>
                  {editMode && (
                    <div className="mt-10 mx-10">
                      <label className="font-bold">Select Size:</label>
                      <select
                        value={selectedSize}
                        onChange={handleSizeChange} // Use onChange to capture size
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
            </div>
          </div>
        )}
        {showConfirmation && (
        <ConfirmationDialog
          message={confirmationMessage}
          onCancel={() => setShowConfirmation(false)}
          onConfirm={() => {
            confirmationCallback();
            setShowConfirmation(false);
          }}
        />
      )}
      </div>
    </div>
  );
};

export default Manageproducts;