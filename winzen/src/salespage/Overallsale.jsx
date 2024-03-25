import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get } from 'firebase/database';
import logo from '../assets/images/logo.png';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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
const db = getDatabase(app);

const Overallsale = () => {
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const historyRef = ref(db, 'history');
        const snapshot = await get(historyRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const staffData = {}; // Object to store total sales, quantity, and number of customers for each staff
          Object.values(data).forEach((item) => {
            const { staffName, customerName, orderItems } = item;
            // Check if staff exists in the objects, if not, initialize with 0
            if (!staffData[staffName]) {
              staffData[staffName] = { totalSales: 0, totalQuantity: 0, totalCustomers: 0, customers: [] };
            }
            // Calculate total sales, quantity, and number of customers for each staff
            Object.values(orderItems).forEach((order) => {
              staffData[staffName].totalSales += order.price;
              staffData[staffName].totalQuantity += order.quantity;
            });
            // Assuming each node has a 'customerName' field
            if (customerName && !staffData[staffName].customers.includes(customerName)) {
              staffData[staffName].totalCustomers++;
              staffData[staffName].customers.push(customerName);
            }
          });
          // Convert object to arrays for chart data
          const staffNames = Object.keys(staffData); // Extract staff names
          const dataset1Data = staffNames.map((staff) => staffData[staff].totalSales);
          const dataset2Data = staffNames.map((staff) => staffData[staff].totalQuantity);
          const dataset3Data = staffNames.map((staff) => staffData[staff].totalCustomers); // New dataset for number of customers
          setChartData({
            labels: staffNames, // Use staff names as labels
            datasets: [
              {
                label: 'Total Sales',
                data: dataset1Data,
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
              },
              {
                label: 'Quantity Sold',
                data: dataset2Data,
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
              },
              {
                label: 'Number of Customers',
                data: dataset3Data,
                backgroundColor: 'rgba(75, 192, 192, 0.5)', // Adjust color as needed
              },
            ],
          });
          setError(null);
        } else {
          setError('No data available');
        }
      } catch (error) {
        setError(error.message);
      }
    };

    fetchData();
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Sales Overview',
      },
    },
  };

  return (
    <div className="flex-1 bg-white bg-cover bg-center bg-no-repeat h-screen">
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
        <h1 className="text-6xl text-center mt-2 font-bold text-black">
          Sales Report
        </h1>
        <h3 className="text-lg md:text-base bg-teal-800 text-gray-200 mb-6 text-center mt-4 md:mt-8 font-semibold">
          ENJOY BROWSING
        </h3>
        {error ? (
          <p>Error: {error}</p>
        ) : (
          <div className="relative border border-gray-300 rounded-lg shadow-lg">
            <img src={logo} alt="Background" className="absolute inset-0 mx-auto my-auto w-40% h-40% object-cover" />
            <div className="relative bg-white bg-opacity-85 p-4 rounded-lg shadow">
            {chartData && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Total Sales</h2>
                  <Bar options={options} data={{ ...chartData, datasets: [chartData.datasets[0]] }} />
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                    {chartData.labels.map((label, index) => (
                      <div key={index} className="bg-emerald-400 p-4 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-2">{label}</h3>
                        <p className='text-sm'>Total Sales: &#8369;{chartData.datasets[0].data[index]}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {chartData && (
                <div className="mt-8">
                  <h2 className="text-2xl font-semibold mb-4">Quantity Sold and Number of Customers</h2>
                  <Bar options={options} data={{ ...chartData, datasets: [chartData.datasets[1], chartData.datasets[2]] }} />
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                    {chartData.labels.map((label, index) => (
                      <div key={index} className="bg-emerald-400 p-4 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-2">{label}</h3>
                        <p className='text-sm'>Quantity Sold: {chartData.datasets[1].data[index]}</p>
                        <p className='text-sm'>Number of Customers: {chartData.datasets[2].data[index]}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );    
};

export default Overallsale;