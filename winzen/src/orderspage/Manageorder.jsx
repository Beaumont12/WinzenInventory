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

const Manageorder = () => {
  const [orders, setOrders] = useState([]);
  const [cancellationStatus, setCancellationStatus] = useState(null);
  const [orderType, setOrderType] = useState('All');

  useEffect(() => {
    const fetchOrders = async () => {
      const db = getDatabase();
      const ordersRef = ref(db, 'orders');
      try {
        const snapshot = await get(ordersRef);
        if (snapshot.exists()) {
          setOrders(snapshot.val()); // Set orders object directly
        } else {
          console.log("No data available");
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, []);

  const cancelOrder = async (orderNumber) => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this order?");
    if (!confirmCancel) return;

    const db = getDatabase();
    const ordersRef = ref(db, `orders/${orderNumber}`);
    const canceledOrdersRef = ref(db, 'canceled');

    try {
      const snapshot = await get(ordersRef);
      if (snapshot.exists()) {
        const orderData = snapshot.val();
        await update(canceledOrdersRef, { [orderNumber]: orderData });
        await update(ref(db), { [`orders/${orderNumber}`]: null });
        setOrders(prevOrders => {
          const updatedOrders = { ...prevOrders };
          delete updatedOrders[orderNumber];
          return updatedOrders;
        });
        setCancellationStatus("Order canceled successfully");
      } else {
        setCancellationStatus("Order does not exist");
      }
    } catch (error) {
      console.error("Error canceling order:", error);
      setCancellationStatus("Error canceling order");
    }
  };

  const filterOrdersByType = (order) => {
    if (orderType === 'All') {
      return true; // Show all orders
    } else if (orderType === 'Dine In') {
      return order.Preference === 'Dine In'; // Show only dine-in orders
    } else if (orderType === 'Take Out') {
      return order.Preference === 'Take Out'; // Show only take-out orders
    }
  };  

  return (  
    <div className="flex-1 bg-white bg-cover bg-center bg-no-repeat" style={{ scrollBehavior: 'smooth'}}>
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
        <h1 className="text-4xl md:text-6xl text-center font-bold text-black mt-2">Ongoing Orders</h1>
        <h3 className="text-lg md:text-base text-center mt-4 md:mt-8 font-semibold bg-teal-800 text-gray-200">PLEASE MAKE SURE TO DOUBLE CHECK</h3>
        <hr className="my-4 border-gray-500 border-2" />
        <div className="flex justify-start mb-4">
          {/* Toggle buttons for filtering orders */}
          <button
            className={`bg-red-500 text-white px-4 py-2 rounded-md mr-4 ${orderType === 'All' ? 'bg-red-700' : ''}`}
            onClick={() => setOrderType('All')}
          >
            All
          </button>
          <button
            className={`bg-blue-500 text-white px-4 py-2 rounded-md mr-4 ${orderType === 'Dine In' ? 'bg-blue-700' : ''}`}
            onClick={() => setOrderType('Dine In')}
          >
            Dine In
          </button>
          <button
            className={`bg-blue-500 text-white px-4 py-2 rounded-md ${orderType === 'Take Out' ? 'bg-blue-700' : ''}`}
            onClick={() => setOrderType('Take Out')}
          >
            Take Out
          </button>
        </div>
        <hr className="my-4 border-gray-500 border-2" />
        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(orders)
          .filter(([orderNumber, order]) => filterOrdersByType(order)) // Filter orders based on order type
          .map(([orderNumber, order]) => (
            <div key={orderNumber} className="rounded-lg shadow-lg bg-gray-100 border border-gray-300 p-4 mb-4 mt-2"> {/* Add custom class for order slip background */}
              <h3 className="text-lg md:text-2xl font-semibold mb-4 text-center bg-yellow-500 text-white">Order Slip</h3>
              <div className="flex justify-between mb-4">
                <p className="text-sm md:text-base font-bold">Order #: {orderNumber}</p> {/* Display order number here */}
                <p className='text-sm md:text-sm text-end'>{order.OrderDateTime}</p>
              </div>
              <div className="flex justify-between mb-4">
                <p className="text-sm md:text-base font-bold">Customer: {order.CustomerName}</p>
                <p className="text-sm md:text-base">Staff: {order.StaffName}</p>
              </div>
              <hr className="my-2" />
              <div className="mt-4">
                <h4 className="text-base md:text-lg font-semibold mb-2">Ordered Items:</h4>
                <ul>
                  {Object.keys(order)
                    .filter(key => key.startsWith("Order_"))
                    .map(key => (
                      <li key={key} className="mb-2">
                        <p className="text-xs md:text-base">{order[key].ProductName}</p>
                        <p className="text-xs md:text-sm">Price: &#8369;{order[key].Price}</p>
                        <p className="text-xs md:text-sm">Quantity: {order[key].Quantity}</p>
                        <p className="text-xs md:text-sm">Size: {order[key].Size}</p>
                      </li>
                    ))}
                </ul>
              </div>
              <hr className="my-4" />
              <div className="flex justify-between">
                <p className="text-sm md:text-base font-bold">Subtotal: &#8369;{order.Subtotal}</p>
                <p className="text-sm md:text-base font-semibold">Discount: &#8369;{order.Discount}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-sm md:text-base font-bold mt-3">Total: &#8369;{order.Total}</p>
              </div>
              <hr className="my-4" />
              <div>
                <p className="text-sm md:text-base text-center bg-yellow-500">{order.Preference}</p>
              </div>
              <div className="flex justify-center">
                <button className="text-white bg-red-800 py-2 px-4 rounded-md mt-6" onClick={() => cancelOrder(orderNumber)}>Cancel Order</button>
              </div>
            </div>
          ))}
        </div>
        {cancellationStatus && <p className="text-center text-sm text-green-600 mt-4">{cancellationStatus}</p>}
      </div>
    </div>
  );
};

export default Manageorder;