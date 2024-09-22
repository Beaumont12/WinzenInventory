import React, { useEffect, useState } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import { initializeApp } from 'firebase/app';

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
      }
    });
  }, []);

  const getStockStatus = (quantity) => {
    if (quantity === 0) return <span className="text-red-600 font-bold">Out of Stock</span>;
    if (quantity < 40) return <span className="text-yellow-600 font-bold">Low Stock</span>;
    return <span className="text-green-600 font-bold">In Stock</span>;
  };

  return (
    <div className="p-4 -ml-56">
      <h1 className="text-6xl text-center mt-2 font-bold text-black">Utensils Inventory</h1>
      <h3 className="text-lg md:text-base bg-teal-800 text-gray-200 mb-6 text-center mt-4 md:mt-8 font-semibold">
        ENJOY BROWSING
      </h3>
      <table className="min-w-full bg-white border border-gray-200 shadow-md">
        <thead>
          <tr className="bg-[#DDB04B] text-white">
            <th className="py-3 px-6 text-center">Util ID</th>
            <th className="py-3 px-6 text-center">Name</th>
            <th className="py-3 px-6 text-center">Quantity</th>
            <th className="py-3 px-6 text-center">Stock Status</th>
          </tr>
        </thead>
        <tbody>
          {utensils.map((utensil, index) => (
            <tr
              key={utensil.id}
              className={`${index % 2 === 0 ? 'bg-[#f9f9f9]' : 'bg-white'} hover:bg-[#ff4d4f] hover:text-white transition-colors`}
            >
              <td className="py-3 px-6 border-b text-center">{utensil.id}</td>
              <td className="py-3 px-6 border-b text-center">{utensil.name}</td>
              <td className="py-3 px-6 border-b text-center">{utensil.stocks}</td>
              <td className="py-3 px-6 border-b text-center">{getStockStatus(utensil.stocks)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Utensils;