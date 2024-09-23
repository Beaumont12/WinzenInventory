import React, { useEffect, useState } from 'react';
import { getDatabase, ref, onValue, set, remove } from 'firebase/database';
import { initializeApp } from 'firebase/app';
import { FaSearch } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

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

const Utensils = () => {
  const [utensils, setUtensils] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUtensilName, setNewUtensilName] = useState('');
  const [newUtensilQuantity, setNewUtensilQuantity] = useState(0);
  const [oldUtensilStock, setOldUtensilStock] = useState(0);
  const [deleteMode, setDeleteMode] = useState(false);
  const [itemsToDelete, setItemsToDelete] = useState([]);
  const [updateMode, setUpdateMode] = useState(false); // New state for update mode
  const [productType, setProductType] = useState('New Product');

  useEffect(() => {
    const db = getDatabase(app);
    const utensilsRef = ref(db, 'stocks/Utensils');

    onValue(utensilsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const utensilsArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setUtensils(utensilsArray);
        checkStockLevels(utensilsArray)
      }else{
        checkStockLevels([]);
      }
    });
  }, []);

  const getStockStatus = (quantity) => {
    if (quantity === 0) return <span className="text-red-600 font-bold">Out of Stock</span>;
    if (quantity < 40) return <span className="text-yellow-600 font-bold">Low Stock</span>;
    return <span className="text-green-600 font-bold">In Stock</span>;
  };

  const filteredUtensils = utensils.filter((utensil) =>
    utensil.name && utensil.name.toLowerCase().includes(searchQuery.toLowerCase())
  );  

  // Modal handling functions
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleSaveNewItem = () => {
    const db = getDatabase(app);
  
    // Ensure that either a new utensil name is entered or an existing one is selected
    if (productType === "New Product" && newUtensilName.trim() === '') {
      alert('Please enter a utensil name.');
      return;
    }
  
    // Handle saving new utensil
    if (productType === "New Product") {
      // Generate a unique ID for the new utensil in the format utilX
      const utensilId = `util${utensils.length + 1}`; // Assuming utensils length is reliable
      const newUtensilData = {
        name: newUtensilName,
        stocks: newUtensilQuantity,
      };
  
      set(ref(db, `stocks/Utensils/${utensilId}`), newUtensilData)
        .then(() => {
          alert('New utensil added successfully!');
          resetModal();
        })
        .catch((error) => {
          console.error('Error saving new item:', error);
        });
    } else {
      // Handle Old Product: Update existing stock
      if (productType === "Old Product" && newUtensilName) {
        const utensil = utensils.find(u => u.name === newUtensilName);
        if (utensil) {
          const updatedStock = parseInt(utensil.stocks) + parseInt(newUtensilQuantity);
  
          set(ref(db, `stocks/Utensils/${utensil.id}/stocks`), updatedStock)
            .then(() => {
              alert('Stock updated successfully!');
              resetModal();
            })
            .catch((error) => {
              console.error('Error updating stock:', error);
            });
        }
      }
    }
  };  

  // Function to reset the modal state
  const resetModal = () => {
    setProductType(''); // Reset product type
    setNewUtensilName(''); // Reset new utensil name
    setNewUtensilQuantity(0); // Reset quantity
    setOldUtensilStock(0); // Reset stock display for old utensil
    setIsModalOpen(false); // Close modal
  };

  const handleToggleDeleteMode = () => {
    setDeleteMode(!deleteMode);
    setItemsToDelete([]); // Clear selected items when entering/exiting delete mode
  };

  const handleSelectItem = (itemId) => {
    if (itemsToDelete.includes(itemId)) {
      setItemsToDelete(itemsToDelete.filter(id => id !== itemId));
    } else {
      setItemsToDelete([...itemsToDelete, itemId]);
    }
  };

  const handleConfirmDelete = () => {
    if (window.confirm("Are you sure you want to delete the selected items?")) {
      const db = getDatabase(app);
      itemsToDelete.forEach(itemId => {
        remove(ref(db, `stocks/Utensils/${itemId}`));
      });
      setItemsToDelete([]);
      alert("Selected items have been deleted.");
    }
  };

  const [alert, setAlert] = useState({ message: '', type: '', isVisible: false });

  const checkStockLevels = (utensils) => {
    if (!utensils) return; // Exit if utensils is undefined or null
  
    let outOfStockCount = 0;
    let lowStockCount = 0;
  
    utensils.forEach((utensil) => {
      if (utensil.stocks === 0) {
        outOfStockCount++;
      } else if (utensil.stocks < 40) {
        lowStockCount++;
      }
    });
  
    let alertMessage = '';
    if (outOfStockCount > 0) {
      alertMessage += `${outOfStockCount} utensil${outOfStockCount > 1 ? 's are' : ' is'} out of stock! `;
    }
    if (lowStockCount > 0) {
      alertMessage += `${lowStockCount} utensil${lowStockCount > 1 ? 's are' : ' is'} low on stock!`;
    }
  
    if (alertMessage) {
      setAlert({ message: alertMessage.trim(), type: outOfStockCount > 0 ? 'error' : 'warning', isVisible: true });
    } else {
      setAlert({ message: '', type: '', isVisible: false }); // Clear alert when stock is fine
    }
  };

  const renderAlert = () => {
    if (!alert.isVisible) return null; // Check visibility instead
  
    const alertStyles = alert.type === 'error' 
      ? 'bg-red-500 text-white' 
      : 'bg-orange-500 text-white';
    
    const icon = alert.type === 'error' 
      ? <FontAwesomeIcon icon={faTimesCircle} className="mr-2" /> // Red error icon
      : <FontAwesomeIcon icon={faExclamationCircle} className="mr-2" />; // Orange warning icon
  
    return (
      <div className={`fixed top-4 right-4 p-4 rounded shadow-lg flex items-center ${alertStyles}`}>
        {icon}
        {alert.message}
      </div>
    );
  };  

  return (
    <div className="p-4 -ml-56">
      {renderAlert()}
      <h1 className="text-6xl text-center mt-2 font-bold text-black">Utensils Inventory</h1>
      <h3 className="text-lg md:text-base bg-teal-800 text-gray-200 mb-6 text-center mt-4 md:mt-8 font-semibold">
        ENJOY BROWSING
      </h3>

      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search by Name..."
          className="border rounded-lg p-2 pl-10 w-full focus:outline-none focus:ring-2 focus:ring-[#DDB04B] shadow-md"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="absolute left-3 top-3 text-gray-400">
          <FaSearch />
        </div>
      </div>

      <table className="min-w-full bg-[#DDB04B] border border-gray-200 shadow-md mt-4 rounded-lg overflow-hidden">
        <thead>
          <tr>
            <td colSpan="2" className="text-white text-left p-4">
                <span className="text-xl font-bold">Utensils</span>
            </td>
            <td colSpan="2" className="text-right p-4">
              <button 
              onClick={handleOpenModal} 
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md shadow-md transition-colors mr-2"
              >+ Add Utensil Stock</button>

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
            <th className="py-3 px-6 text-center">Util ID</th>
            <th className="py-3 px-6 text-center">Name</th>
            <th className="py-3 px-6 text-center">Quantity</th>
            <th className="py-3 px-6 text-center">Stock Status</th>
            {deleteMode && <th className="py-3 px-6 text-center">Select</th>}
          </tr>
        </thead>
        <tbody>
          {filteredUtensils.map((utensil, index) => (
            <tr
              key={utensil.id}
              className={`${index % 2 === 0 ? 'bg-[#f9f9f9]' : 'bg-white'} hover:bg-gray-200 hover:text-pink-500 transition-colors`}
            >
              <td className="py-3 px-6 border-b text-center">{utensil.id}</td>
              <td className="py-3 px-6 border-b text-center">{utensil.name}</td>
              <td className="py-3 px-6 border-b text-center">{utensil.stocks}</td>
              <td className="py-3 px-6 border-b text-center">{getStockStatus(utensil.stocks)}</td>
              {deleteMode && (
                <td className="py-3 px-6 border-b text-center">
                  <input
                    type="checkbox"
                    checked={itemsToDelete.includes(utensil.id)}
                    onChange={() => handleSelectItem(utensil.id)}
                  />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal for Adding or Updating Utensil */}
      {isModalOpen && (
        <div className="fixed top-0 right-0 w-1/2 h-full bg-[#F9F9F9] shadow-lg z-50 opacity-95">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Add or Update Item</h2>

            {/* Product Type (New or Old) */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Stock Type</label>
              <select
                className="border rounded-lg p-2 w-full shadow-md focus:outline-none focus:ring-2 focus:ring-[#DDB04B] transition-shadow"
                value={productType}
                onChange={(e) => {
                  const type = e.target.value;
                  setProductType(type);
                  setNewUtensilName(''); // Reset utensil name if switching types.
                  setOldUtensilStock(0); // Reset stock display for old utensil.
                }}
              >
                <option value="New Product">New Stock</option>
                <option value="Old Product">Old Stock</option>
              </select>
            </div>

            {/* Product Name Input (for New Product) */}
            {productType === "New Product" && (
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Utensil Name</label>
                <input
                  type="text"
                  className="border rounded-lg p-2 w-full shadow-md focus:outline-none focus:ring-2 focus:ring-[#DDB04B] transition-shadow"
                  placeholder="Enter utensil name"
                  value={newUtensilName}
                  onChange={(e) => setNewUtensilName(e.target.value)}
                />
              </div>
            )}

            {/* For Old Product: Utensil Name Picker */}
            {productType === "Old Product" && (
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Select Utensil</label>
                <select
                  className="border rounded-lg p-2 w-full shadow-md focus:outline-none focus:ring-2 focus:ring-[#DDB04B] transition-shadow"
                  value={newUtensilName}
                  onChange={(e) => {
                    const selectedUtensil = e.target.value;
                    setNewUtensilName(selectedUtensil);
                    setOldUtensilStock(utensils.find(u => u.name === selectedUtensil)?.stocks || 0);
                  }}
                >
                  <option value="">Select Utensil</option>
                  {utensils.map((utensil) => (
                    <option key={utensil.id} value={utensil.name}>{utensil.name}</option>
                  ))}
                </select>
                {/* Display current stock for the selected old utensil */}
                {newUtensilName && (
                  <div className="mt-2 text-gray-600">
                    Current Stock: {oldUtensilStock}
                  </div>
                )}
              </div>
            )}

            {/* Quantity Input */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Quantity</label>
              <input
                type="number"
                className="border rounded-lg p-2 w-full shadow-md focus:outline-none focus:ring-2 focus:ring-[#DDB04B] transition-shadow"
                placeholder="Enter quantity"
                value={newUtensilQuantity}
                onChange={(e) => setNewUtensilQuantity(e.target.value)}
              />
            </div>

            <button
              onClick={handleSaveNewItem}
              className="bg-teal-600 hover:bg-teal-800 text-white py-2 px-4 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-[#DDB04B] transition-shadow mr-2"
            >
              {updateMode ? 'Update' : 'Save'}
            </button>

            <button
              onClick={handleCloseModal}
              className="mt-4 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-[#DDB04B] transition-shadow"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Utensils;