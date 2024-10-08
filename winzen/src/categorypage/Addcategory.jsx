import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, set } from 'firebase/database';

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

const AddCategory = () => {
  const [categoryName, setCategoryName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState({});
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = () => {
    const db = getDatabase();
    const categoriesRef = ref(db, 'categories');
    get(categoriesRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          setCategories(snapshot.val());
        }
      })
      .catch((error) => {
        console.error('Error loading categories:', error);
      });
  };

  const handleAddCategory = () => {
    if (!categoryName || !categoryId) {
      showAlertMessage('Please enter both category name and ID');
      return;
    }

    // Check if the category ID already exists
    if (categories && categories[categoryId]) {
      showAlertMessage('Category ID already exists. Please choose a unique ID.');
      return;
    }

    const db = getDatabase();
    const categoriesRef = ref(db, 'categories/' + categoryId); // Specify the category ID in the reference path
  
    const newCategoryData = {
      Name: categoryName
    };    
  
    set(categoriesRef, newCategoryData) // Pass the reference and data directly to set
      .then(() => {
        showConfirmationMessage('Category added successfully');
        setCategoryName('');
        setCategoryId('');
        loadCategories(); // Reload categories after adding a new one
      })
      .catch((error) => {
        console.error('Error adding category:', error);
        showAlertMessage('Failed to add category');
      });
  };

  const showAlertMessage = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
  };

  const hideAlertMessage = () => {
    setShowAlert(false);
  };

  const showConfirmationMessage = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
  };

  return (
    <div className="flex-1 bg-white bg-opacity-20 bg-cover bg-center bg-no-repeat h-screen">
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
            background: linear-gradient(180deg, rgba(165,164,168,1) 0%, rgba(190,190,195,1) 35%, rgba(255,255,255,1) 100%);
            border-radius: 0px;
          }

          ::-webkit-scrollbar-thumb:hover {
            background: #555;
          }
        `}
      </style>
      <div className="p-4">
        <h1 className="text-6xl text-black text-center mt-2 font-bold ">Add Category</h1>
        <h3 className="text-lg md:text-base text-gray-200 text-center mt-4 md:mt-8 font-semibold bg-teal-800">MAKE SURE CATEGORY ID IS UNIQUE</h3>

        <div className="mt-8 mx-auto max-w-md">
          <div className="bg-gray-100 shadow-lg shadow-gray-300 border border-gray-300 rounded-lg px-8 pt-6 pb-8 mb-4">
            <p className="text-gray-800 text-base font-semibold mb-2">Category ID:</p>
            <input
              type="text"
              placeholder="Enter category ID (ex: category_1)"
              className="block w-full px-4 py-2 text-gray-800 bg-white border border-gray-300 rounded-md focus:outline-none focus:border-emerald-500 mb-4"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            />
            <p className="text-gray-800 text-base font-semibold mb-2">Category Name:</p>
            <input
              type="text"
              placeholder="Enter category name"
              className="block w-full px-4 py-2 text-gray-800 bg-white border border-gray-300 rounded-md focus:outline-none focus:border-emerald-500 mb-4"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
            />
            <button
              className="block w-full py-2 px-4 bg-yellow-600 text-white font-semibold rounded-md hover:bg-emerald-600 focus:outline-none focus:bg-emerald-600"
              onClick={handleAddCategory}
            >
              Add Category
            </button>
          </div>
        </div>
      </div>
      {showAlert && (
        <div className="fixed top-0 right-0 w-full h-full bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-4 rounded-md">
            <p className="text-xl font-semibold mb-4">{alertMessage}</p>
            <button className="text-white bg-emerald-400 py-1 px-4 rounded-md" onClick={hideAlertMessage}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddCategory;