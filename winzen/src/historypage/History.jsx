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

const History = () => {
  const [historyData, setHistoryData] = useState([]);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Fetch history data from the database
    const fetchData = async () => {
      try {
        const db = getDatabase(); // Obtain the database reference directly
        const historyRef = ref(db, 'history');
        const snapshot = await get(historyRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          // Convert history object into an array of objects
          const historyArray = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
            totalQuantity: Object.values(data[key].orderItems).reduce((acc, item) => acc + item.quantity, 0)
          }));
          setHistoryData(historyArray);
        } else {
          setHistoryData([]);
        }
      } catch (error) {
        console.error('Error fetching history data:', error);
      }
    };
    fetchData();
  }, []);

  const handleHistoryClick = (id) => {
    // Find the selected history item by its ID
    const selected = historyData.find((item) => item.id === id);
    setSelectedHistory(selected);
  };

  const closeModal = () => {
    setSelectedHistory(null);
  };

  // Handler for rendering order items details
  const renderOrderItems = (orderItems) => {
    return (
      <ul>
        {Object.values(orderItems).map((item, index) => (
          <li key={index}>
            <p>Product Name: {item.productName}</p>
            <p>Quantity: {item.quantity}</p>
            <p>Size: {item.size}</p>
            <p>Price: {item.price}</p>
          </li>
        ))}
      </ul>
    );
  };

  // Function to handle search input change
  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter historyData based on searchQuery
  const filteredHistoryData = historyData.filter(history => history.orderNumber.includes(searchQuery));

  return (
    <div>
      {/* Display detailed information for the selected history item in a modal */}
      {selectedHistory && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-gray-900 bg-opacity-50 overflow-y-auto">
          <div className="bg-white p-8 rounded-lg z-50 flex justify-center items-center w-auto h-auto">
            {/* Modal content */}
            <div className="mt-2 items-center justify-center flex">
              <div key={selectedHistory.id} className="rounded-lg shadow-lg bg-gray-100 border border-gray-300 p-4 mb-4 relative" style={{ maxHeight: "80vh", overflowY: "auto", paddingTop: "3rem" }}>
                <button className="absolute top-2 right-2 text-white items-center mb-3 hover:text-gray-700 bg-red-600 px-2 rounded-lg" onClick={closeModal}>
                  Close
                </button>
                <h3 className="text-lg md:text-2xl font-semibold mb-4 text-center bg-yellow-500 text-white">Order Slip</h3>
                <div className="flex justify-between mb-4">
                  <p className="text-sm md:text-base font-bold">Order #: {selectedHistory.orderNumber}</p>
                  <p className='text-sm md:text-base ml-6 text-end'>{selectedHistory.orderDateTime}</p>
                </div>
                <div className="flex justify-between mb-4">
                  <p className="text-sm md:text-base font-bold">Customer: {selectedHistory.customerName}</p>
                  <p className="text-sm md:text-base">Staff: {selectedHistory.staffName}</p>
                </div>
                <hr className="my-2" />
                <div className="mt-4">
                  <h4 className="text-base md:text-lg font-semibold mb-2">Ordered Items:</h4>
                  {renderOrderItems(selectedHistory.orderItems)}
                </div>
                <hr className="my-4" />
                <div className="flex justify-between">
                  <p className="text-sm md:text-base font-bold">Subtotal: {selectedHistory.subtotal}</p>
                  <p className="text-sm md:text-base font-semibold">Discount: {selectedHistory.discount}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm md:text-base font-bold mt-3">Total: {selectedHistory.total}</p>
                </div>
                <hr className="my-4" />
                <div>
                  <p className="text-sm md:text-base text-center bg-yellow-500">{selectedHistory.preference}</p>
                </div>
              </div>
            </div>
            {/* Add additional fields as needed */}
          </div>
        </div>
      )}

      {/* Render history data in a table-like format */}
      <div className="p-4">
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
        <h1 className="text-6xl text-center mt-2 font-bold">Transaction History</h1>
        <h3 className="text-lg md:text-base text-center mt-4 md:mt-8 font-semibold bg-teal-800 text-gray-200">PLEASE MAKE SURE TO DOUBLE CHECK</h3>
        <div className="mt-4">
          <hr className="my-4 border-gray-500 border-2" />
          <input
            type="text"
            placeholder="Search products by order number"
            value={searchQuery}
            onChange={handleSearchInputChange}
            className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 mb-4"
          />
          <hr className="my-4 border-gray-500 border-2" />
          <div className="flex justify-between items-center p-4 my-4 bg-yellow-500 rounded-lg shadow-md font-extrabold">
            <span className="text-lg w-1/4 text-center">Order #</span>
            <span className="text-lg w-1/4 text-center">Staff Name</span>
            <span className="text-lg w-1/4 text-center">Quantity</span>
            <span className="text-lg w-1/4 text-center">Total</span>
          </div>
          <ul>
            {filteredHistoryData.map((history) => (
              <li key={history.id} className="cursor-pointer" onClick={() => handleHistoryClick(history.id)}>
                <div className="flex justify-between items-center p-4 my-2 bg-white rounded-lg shadow-md">
                  <span className="text-lg font-semibold w-1/4 text-center text-gray-600">{history.orderNumber}</span>
                  <span className="text-lg w-1/4 text-center font-semibold text-gray-600">{history.staffName}</span>
                  <span className="text-lg w-1/4 text-center font-semibold text-gray-600">{history.totalQuantity}</span>
                  <span className="text-lg w-1/4 text-center font-semibold text-gray-600">&#8369;{history.total}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default History;