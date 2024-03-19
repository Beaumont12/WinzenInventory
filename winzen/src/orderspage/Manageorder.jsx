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

  return (  
    <div className="flex-1 bg-gray-200 bg-cover bg-center bg-no-repeat">
      <div className="p-4 my-2">
        <h1 className="text-4xl md:text-6xl text-center font-bold">Ongoing Orders</h1>
        <h3 className="text-lg md:text-base text-center mt-4 md:mt-8 font-semibold bg-yellow-600 text-white">PLEASE MAKE SURE TO DOUBLE CHECK</h3>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(orders).map(([orderNumber, order]) => (
            <div key={orderNumber} className="border border-gray-500 p-4 mb-4 order-slip-bg"> {/* Add custom class for order slip background */}
              <h3 className="text-lg md:text-2xl font-semibold mb-4 text-center">Order Slip</h3>
              <div className="flex justify-between mb-4">
                <p className="text-sm md:text-base font-bold">Order #: {orderNumber}</p> {/* Display order number here */}
                <p className='text-sm md:text-sm text-end'>{order.OrderDateTime}</p>
              </div>
              <div className="flex justify-between mb-4">
                <p className="text-sm md:text-base">Customer: {order.CustomerName}</p>
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
                        <p className="text-xs md:text-sm">Price: ${order[key].Price}</p>
                        <p className="text-xs md:text-sm">Quantity: {order[key].Quantity}</p>
                        <p className="text-xs md:text-sm">Size: {order[key].Size}</p>
                      </li>
                    ))}
                </ul>
              </div>
              <hr className="my-4" />
              <div className="flex justify-between">
                <p className="text-sm md:text-base font-semibold">Subtotal: ${order.Subtotal}</p>
                <p className="text-sm md:text-base font-semibold">Discount: ${order.Discount}</p>
                <p className="text-sm md:text-base font-bold">Total: ${order.Total}</p>
              </div>
              <hr className="my-4" />
              <div>
                <p className="text-sm md:text-base text-center bg-yellow-500">{order.Preference}</p>
              </div>
              <div className="flex justify-center">
                <button className="text-white bg-red-700 py-2 px-4 rounded-md mt-6" onClick={() => cancelOrder(orderNumber)}>Cancel Order</button>
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