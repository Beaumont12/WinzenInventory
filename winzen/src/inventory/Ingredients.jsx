import React, { useEffect, useState } from 'react';
import { getDatabase, ref, onValue, set, remove } from 'firebase/database';
import { initializeApp } from 'firebase/app';
import { FaSearch } from 'react-icons/fa'; // Importing Font Awesome Search icon

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDqmb4K_bAd0ySj3QoEeDVT-N0nCMINVN0",
  authDomain: "wenzinpossystem.firebaseapp.com",
  databaseURL: "https://wenzinpossystem-default-rtdb.firebaseio.com",
  projectId: "wenzinpossystem",
  storageBucket: "wenzinpossystem.appspot.com",
  messagingSenderId: "910317765447",
  appId: "1:910317765447:web:1157c166ae49d0590d4262"
};
const app = initializeApp(firebaseConfig);

const Ingredients = () => {
  const [ingredients, setIngredients] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('Bread');
  const [searchQuery, setSearchQuery] = useState(''); 
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [newProductName, setNewProductName] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('');
  const [newProductQuantity, setNewProductQuantity] = useState(0); 
  const [newCategoryName, setNewCategoryName] = useState('');
  const [deleteMode, setDeleteMode] = useState(false); 
  const [itemsToDelete, setItemsToDelete] = useState([]);
  const [oldProductStock, setOldProductStock] = useState(0); 
  const [productType, setProductType] = useState('New Product');
  

  useEffect(() => {
    const db = getDatabase(app);
    const ingredientsRef = ref(db, 'stocks/Ingredients');

    onValue(ingredientsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setIngredients(data);
      }
    });
  }, []);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const getStockStatus = (quantity) => {
    if (quantity === 0) return { status: "Out of Stock", color: "text-red-600" };
    if (quantity < 40) return { status: "Low Stock", color: "text-yellow-600" };
    return { status: "In Stock", color: "text-green-600" };
  };

  // Icon mapping based on category
  const iconMap = {
    Bread: '🥖',
    Dairy: '🥛',
    Vegetables: '🥦',
    Fruits: '🍎',
    Meat: '🍗',
    Spices: '🌶️',
    Cakes: '🍰',
    Cookies: '🍪',
    Curve: '🌀',
  };

  // Filtered ingredients based on search query
  const filteredIngredients = Object.entries(ingredients[selectedCategory] || {}).filter(([key, ingredient]) => {
    return (
      key.includes(searchQuery) ||
      ingredient.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Modal handling functions
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  // Function to handle saving new item
  const handleSaveNewItem = () => {
    const db = getDatabase(app);
  
    // Check if category is valid
    if (!newProductCategory) {
      alert('Please select a category.');
      return;
    }
  
    // Handle adding a new category
    if (newProductCategory === "Add New Category" && newCategoryName.trim() === '') {
      alert('Please enter a new category name.');
      return;
    }
  
    // Ensure that either new product name is entered or an existing one is selected
    if (productType === "New Product" && newProductName.trim() === '') {
      alert('Please enter a product name.');
      return;
    }
  
    // If adding a new category, save it in Firebase
    if (newProductCategory === "Add New Category") {
      const categoryRef = ref(db, `stocks/Ingredients/${newCategoryName}`);
      set(categoryRef, {}).then(() => {
        // Now proceed to save the new product in this new category
        const productId = `ID_${Date.now()}`; // Generate a unique ID for the new product
        const newProductData = {
          name: newProductName,
          stocks: newProductQuantity,
        };
  
        set(ref(db, `stocks/Ingredients/${newCategoryName}/${productId}`), newProductData)
          .then(() => {
            alert('New stock item added successfully!');
            resetModal(); // Reset modal after saving
          })
          .catch((error) => {
            console.error('Error saving new item:', error);
          });
      }).catch((error) => {
        console.error('Error saving new category:', error);
      });
    } else {
      // Handle Old Product: Update existing stock
      if (productType === "Old Product" && newProductName) {
        const currentStock = ingredients[newProductCategory][newProductName].stocks;
        const updatedStock = parseInt(currentStock) + parseInt(newProductQuantity);
  
        set(ref(db, `stocks/Ingredients/${newProductCategory}/${newProductName}/stocks`), updatedStock)
          .then(() => {
            alert('Stock updated successfully!');
            resetModal(); // Reset modal after updating
          })
          .catch((error) => {
            console.error('Error updating stock:', error);
          });
      } else {
        // Handle New Product without a new category
        if (newProductName && !ingredients[newProductCategory]?.[newProductName]) {
          const productId = `ID_${Date.now()}`; // Generate a unique ID for the new product
          const newProductData = {
            name: newProductName,
            stocks: newProductQuantity,
          };
  
          // Save new product in the selected category in Firebase
          set(ref(db, `stocks/Ingredients/${newProductCategory}/${productId}`), newProductData)
            .then(() => {
              alert('New stock item added successfully!');
              resetModal(); // Reset modal after saving
            })
            .catch((error) => {
              console.error('Error saving new item:', error);
            });
        }
      }
    }
  };
  
  // Function to reset the modal state
  const resetModal = () => {
    setProductType(''); // Reset product type
    setNewProductCategory(''); // Reset new product category
    setNewCategoryName(''); // Reset new category name
    setNewProductName(''); // Reset product name
    setNewProductQuantity(0); // Reset quantity
    setOldProductStock(0); // Reset stock display for old product
    setIsModalOpen(false); // Close modal
  };
    

  // Handle delete mode toggle
  const handleToggleDeleteMode = () => {
    setDeleteMode(!deleteMode);
    setItemsToDelete([]); // Clear selected items when entering/exiting delete mode
  };

  // Handle selecting items to delete
  const handleSelectItem = (itemId) => {
    if (itemsToDelete.includes(itemId)) {
      setItemsToDelete(itemsToDelete.filter(id => id !== itemId));
    } else {
      setItemsToDelete([...itemsToDelete, itemId]);
    }
  };

  // Handle confirming deletion
  const handleConfirmDelete = () => {
    if (window.confirm("Are you sure you want to delete the selected items?")) {
      const db = getDatabase(app);
      itemsToDelete.forEach(itemId => {
        remove(ref(db, `stocks/Ingredients/${selectedCategory}/${itemId}`));
      });
      setItemsToDelete([]);
      alert("Selected items have been deleted.");
    }
  };

  return (
    <div className="p-4 -ml-56 bg-[#F9F9F9]">
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
            background: linear-gradient(180deg, rgba(165, 164, 168, 1) 0%, rgba(190, 190, 195, 1) 35%, rgba(255, 255, 255, 1) 100%);
            border-radius: 0px;
          }

          ::-webkit-scrollbar-thumb:hover {
            background: #555;
          }
        `}
      </style>

      <h1 className="text-6xl text-center mt-2 font-bold text-black">Ingredients Inventory</h1>
      <h3 className="text-lg md:text-base bg-teal-800 text-gray-200 mb-6 text-center mt-4 md:mt-8 font-semibold">
        ENJOY BROWSING
      </h3>

      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search by ID or Name..."
          className="border rounded-lg p-2 pl-10 w-full focus:outline-none focus:ring-2 focus:ring-[#DDB04B] shadow-md"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="absolute left-3 top-3 text-gray-400">
          <FaSearch />
        </div>
      </div>

      {/* Category selector */}
      <div className="grid grid-cols-4 gap-4 mb-6 justify-items-center">
        {Object.keys(ingredients).map((category) => (
          <div 
            key={category}
            onClick={() => handleCategoryClick(category)}
            className={`flex items-center p-4 rounded-lg shadow-md cursor-pointer ${selectedCategory === category ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            <div className="text-4xl mr-2">{iconMap[category]}</div>
            <span className="text-xl font-semibold">{category}</span>
          </div>
        ))}
      </div>

      <table className="min-w-full bg-[#DDB04B] border border-gray-200 shadow-md mt-4 rounded-lg overflow-hidden">
        <thead>
          <tr>
            <td colSpan="2" className="text-white text-left p-4">
              <span className="text-xl font-bold">Ingredients</span>
            </td>
            <td colSpan="2" className="text-right p-4">
              <button 
                onClick={handleOpenModal} 
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md shadow-md transition-colors mr-2"
              >
                + Add Stock
              </button>

              {/* Delete Button */}
              <button 
                onClick={handleToggleDeleteMode} 
                className={`bg-${deleteMode ? 'red-500' : 'red-600'} hover:bg-${deleteMode ? 'red-600' : '[#ff4d4f]'} text-white font-bold py-2 px-4 rounded-md shadow-md transition-colors`}
              >
                {deleteMode ? 'Cancel' : 'Delete'}
              </button>

              {/* Confirm Delete Button (visible in delete mode) */}
              {deleteMode && (
                <button 
                  onClick={handleConfirmDelete} 
                  className="ml-2 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md shadow-md transition-colors"
                >
                  Confirm Delete
                </button>
              )}
            </td>
          </tr>
          <tr className="bg-[#DDB04B] text-white">
            <th className="py-3 px-6 text-center">Item ID</th>
            <th className="py-3 px-6 text-center">Name</th>
            <th className="py-3 px-6 text-center">Quantity</th>
            <th className="py-3 px-6 text-center">Stock Status</th>
            {deleteMode && <th className="py-3 px-6 text-center">Select</th>}
          </tr>
        </thead>
        <tbody>
          {filteredIngredients.map(([key, ingredient], index) => {
            const { status, color } = getStockStatus(ingredient.stocks);
            return (
              <tr
                key={key}
                className={`${index % 2 === 0 ? 'bg-[#f9f9f9]' : 'bg-white'} hover:bg-[#ff4d4f] hover:text-white transition-colors`}
              >
                <td className="py-3 px-6 border-b text-center">{key}</td>
                <td className="py-3 px-6 border-b text-center">{ingredient.name}</td>
                <td className="py-3 px-6 border-b text-center">{ingredient.stocks}</td>
                <td className={`py-3 px-6 border-b text-center ${color}`}>{status}</td>

                {deleteMode && (
                  <td className="py-3 px-6 border-b text-center">
                    <input
                      type="checkbox"
                      checked={itemsToDelete.includes(key)}
                      onChange={() => handleSelectItem(key)}
                    />
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Modal for Adding New Item */}
      {isModalOpen && (
        <div className="fixed top-0 right-0 w-1/2 h-full bg-[#F9F9F9] shadow-lg z-50 opacity-95">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Add or Update Item</h2>

            {/* Product Type (New or Old) */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Stock Type</label>
              <select
                className="border rounded-lg p-2 w-full"
                value={productType}
                onChange={(e) => {
                  const type = e.target.value;
                  setProductType(type);
                  setNewProductCategory(''); // Reset category when switching types.
                  setNewProductName(''); // Reset product name if switching types.
                  setOldProductStock(0); // Reset stock display for old product.
                  setNewCategoryName(''); // Reset new category name when switching to old product
                }}
              >
                <option value="New Product">New Stock</option>
                <option value="Old Product">Old Stock</option>
              </select>
            </div>

            {/* Category Selection */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Category</label>
              <select
                className="border rounded-lg p-2 w-full"
                value={newProductCategory}
                onChange={(e) => {
                  const selectedCategory = e.target.value;
                  setNewProductCategory(selectedCategory);
                  setNewProductName(''); // Reset product name when category changes.
                  setOldProductStock(0); // Reset stock display for old product.
                  if (selectedCategory !== "Add New Category") {
                    setNewCategoryName(''); // Reset new category name if not adding a new category
                  }
                }}
              >
                <option value="">Select Category</option>
                {Object.keys(ingredients).map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
                {productType === "New Product" && <option value="Add New Category">Add New Category</option>}
              </select>
            </div>

            {/* New Category Input */}
            {newProductCategory === "Add New Category" && productType === "New Product" && (
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">New Category Name</label>
                <input
                  type="text"
                  className="border rounded-lg p-2 w-full"
                  placeholder="Enter new category name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
              </div>
            )}

            {/* Product Name Input (for New Product) */}
            {productType === "New Product" && (
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Product Name</label>
                <input
                  type="text"
                  className="border rounded-lg p-2 w-full"
                  placeholder="Enter product name"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                />
              </div>
            )}

            {/* For Old Product: Product Name Picker */}
            {productType === "Old Product" && newProductCategory && (
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Product Name</label>
                <select
                  className="border rounded-lg p-2 w-full"
                  value={newProductName}
                  onChange={(e) => {
                    setNewProductName(e.target.value);
                    setOldProductStock(ingredients[newProductCategory][e.target.value]?.stocks || 0);
                  }}
                >
                  <option value="">Select Product</option>
                  {Object.entries(ingredients[newProductCategory] || {}).map(([key, ingredient]) => (
                    <option key={key} value={key}>{ingredient.name}</option>
                  ))}
                </select>
                {/* Display current stock for the selected old product */}
                {newProductName && (
                  <div className="mt-2 text-gray-600">
                    Current Stock: {oldProductStock}
                  </div>
                )}
              </div>
            )}

            {/* Quantity Input */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Quantity</label>
              <input
                type="number"
                className="border rounded-lg p-2 w-full"
                placeholder="Enter quantity"
                value={newProductQuantity}
                onChange={(e) => setNewProductQuantity(e.target.value)}
              />
            </div>

            <button
              onClick={handleSaveNewItem}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
            >
              Save
            </button>

            <button
              onClick={handleCloseModal}
              className="mt-4 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Ingredients;