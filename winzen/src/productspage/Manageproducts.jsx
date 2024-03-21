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

  useEffect(() => {
    loadCategories();
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

  return (
    <div className="flex-1 bg-gradient-to-t to-gray-400 from-white bg-cover bg-center bg-no-repeat h-screen rounded-lg">
      <div className="p-4 my-2">
        <h1 className="text-6xl text-center mt-2 font-bold text-white">Manage Products!</h1>
        <h3 className="text-lg bg-teal-800 text-gray-200 text-center mt-4 md:mt-8 font-semibold">Edit Products Only When Necessary</h3>
        <hr className="my-4 border-gray-500 border-2"/>
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
          {categories.map((category, index) => (
            <div key={index} className="mr-24 mb-4">
              <button className="bg-yellow-500 px-4 py-2 text-white text-lg rounded-lg font-bold">{category.Name}</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageProducts;