import React, { useEffect, useState } from 'react';
import { getDatabase, ref, get } from 'firebase/database';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { initializeApp } from 'firebase/app';

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

ChartJS.register(ArcElement, Tooltip, Legend);

const Card = ({ icon, bgColor, title, value }) => {
  return (
    <div className={`bg-${bgColor}-500 p-4 rounded-lg shadow-lg text-center w-64 h-64 flex flex-col justify-center items-center`}>
      <div className="rounded-full w-20 h-20 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
};

const Home = () => {
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalStaff, setTotalStaff] = useState(0);
  const [totalCategories, setTotalCategories] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminRole, setAdminRole] = useState('');
  const [cancelledCount, setCancelledCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [returningCustomers, setReturningCustomers] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [orders, setOrders] = useState({});
  const [selectedMonth, setSelectedMonth] = useState('');

  const months = [
    { value: '', label: 'Overall' },
    { value: 'Jan', label: 'Jan' },
    { value: 'Feb', label: 'Feb' },
    { value: 'Mar', label: 'Mar' },
    { value: 'Apr', label: 'Apr' },
    { value: 'May', label: 'May' },
    { value: 'Jun', label: 'Jun' },
    { value: 'Jul', label: 'Jul' },
    { value: 'Aug', label: 'Aug' },
    { value: 'Sep', label: 'Sep' },
    { value: 'Oct', label: 'Oct' },
    { value: 'Nov', label: 'Nov' },
    { value: 'Dec', label: 'Dec' },
  ];

  useEffect(() => {
    // Fetch orders data from Firebase
    const fetchOrders = async () => {
      const db = getDatabase();
      const ordersRef = ref(db, 'orders');
      try {
        const ordersSnapshot = await get(ordersRef);
        if (ordersSnapshot.exists()) {
          setOrders(ordersSnapshot.val());
        } else {
          console.log('No orders found');
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    // Fetch admin data from local storage
    const loggedInUserName = localStorage.getItem('loggedInStaffName');
    const loggedInUserEmail = localStorage.getItem('loggedInStaffEmail');
    const loggedInUserUsername = localStorage.getItem('loggedInStaffId');
    const loggedInUserRole = localStorage.getItem('loggedInStaffRole')
    setAdminName(loggedInUserName);
    setAdminEmail(loggedInUserEmail);
    setAdminUsername(loggedInUserUsername);
    setAdminRole(loggedInUserRole);
  }, []);  

  useEffect(() => {
    const fetchData = async () => {
      const db = getDatabase();
      const currentMonth = new Date().toLocaleString('default', { month: 'short' });
      
      // Fetch total products
      const productsRef = ref(db, 'products');
      const productsSnapshot = await get(productsRef);
      setTotalProducts(productsSnapshot.exists() ? Object.keys(productsSnapshot.val()).length : 0);
      
      // Fetch total staff
      const staffRef = ref(db, 'staffs');
      const staffSnapshot = await get(staffRef);
      setTotalStaff(staffSnapshot.exists() ? Object.keys(staffSnapshot.val()).length : 0);
      
      // Fetch total categories
      const categoriesRef = ref(db, 'categories');
      const categoriesSnapshot = await get(categoriesRef);
      setTotalCategories(categoriesSnapshot.exists() ? Object.keys(categoriesSnapshot.val()).length : 0);
      
      // Fetch total sales for the selected month
      const salesRef = ref(db, 'history');
      const salesSnapshot = await get(salesRef);
      if (salesSnapshot.exists()) {
        let total = 0;
        let cancelled = 0;
        let completed = 0;
        let returning = 0;
        let customers = {};
        
        // Calculate total sales, cancelled, and completed orders
        salesSnapshot.forEach((childSnapshot) => {
          const orderDateTime = childSnapshot.val().orderDateTime;
          const orderMonth = new Date(orderDateTime).toLocaleString('default', { month: 'short' });
          if (selectedMonth === '' || orderMonth === selectedMonth) {
            total += parseFloat(childSnapshot.val().total) || 0;
            const orderStatus = childSnapshot.val().status;
            if (orderStatus === 'Cancelled') {
              cancelled++;
            } else {
              completed++;
            }
            const customerName = childSnapshot.val().customerName;
            if (!customers[customerName]) {
              customers[customerName] = true;
            } else {
              returning++;
            }
          }
        });
  
        const cancelledRef = ref(db, 'canceled');
          const cancelledSnapshot = await get(cancelledRef);
          if (cancelledSnapshot.exists()) {
            let cancelled = 0;
            cancelledSnapshot.forEach((childSnapshot) => {
              const orderDateTime = childSnapshot.val().OrderDateTime; // Corrected field name
              const orderMonth = new Date(orderDateTime).toLocaleString('default', { month: 'short' });
              if (selectedMonth === '' || orderMonth === selectedMonth) {
                cancelled++;
              }
            });
            setCancelledCount(cancelled);
          } else {
            setCancelledCount(0);
          }
  
        // Fetch count of completed orders
        setCompletedCount(completed);
  
        setReturningCustomers(returning);
        setTotalCustomers(Object.keys(customers).length);
        
        setTotalSales(total);
      }
    };
  
    fetchData();
  }, [selectedMonth]); // Include selectedMonth in the dependency array  

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  const doughnutChartData1 = {
    labels: ['Cancelled', 'Completed'],
    datasets: [
      {
        label: 'Overview',
        data: [cancelledCount, completedCount],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const doughnutChartData2 = {
    labels: ['Returning Customers', 'New Customers'],
    datasets: [
      {
        label: 'Overview',
        data: [returningCustomers, totalCustomers],
        backgroundColor: [
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
        ],
        borderColor: [
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="flex-1 bg-white bg-cover bg-center bg-no-repeat h-screen">
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
        <div className='border border-gray-300 p-4 rounded-lg bg-gray-100 flex items-center justify-between'>
          <div className='md:mb-4 h-auto'>
            <h2 className="text-xs font-semibold mb-3">Dashboard Panel</h2>
            <p className="text-3xl font-bold">Welcome back, {adminName}!</p>
            <p className="text-lg">Enjoy browsing</p>
          </div>
          <div className="flex flex-row items-center space-x-4 bg-blue-300 py-4 px-6 rounded-lg shadow-lg">
            <i className="material-icons text-7xl text-black">person</i>
            <div className="flex flex-col">
              <p className="text-xl font-semibold mb-1">{adminName}</p>
              <p className="text-xs text-black"><strong>Role:</strong> {adminRole}</p>
              <p className="text-xs text-black"><strong>Email:</strong> {adminEmail}</p>
              <p className="text-xs text-black"><strong>Staff ID:</strong> {adminUsername}</p>
            </div>
          </div>
        </div>
        <div className="flex justify-around mt-10">
          <Card
            icon={<i className="material-icons text-white shadow-xl rounded-lg p-1 text-7xl">store</i>}
            bgColor="blue"
            title="Total Products"
            value={<span className="text-md">{totalProducts}</span>}
          />
          <Card
            icon={<i className="material-icons text-white shadow-xl rounded-lg p-1 text-7xl">people</i>}
            bgColor="green"
            title="Total Staff"
            value={<span className="text-md">{totalStaff}</span>}
          />
          <Card
            icon={<i className="material-icons text-white shadow-xl rounded-lg p-1 text-7xl">category</i>}
            bgColor="yellow"
            title="Total Categories"
            value={<span className="text-md">{totalCategories}</span>}
          />
          <Card
            icon={<i className="material-icons text-white shadow-xl rounded-lg p-1 text-7xl">monetization_on</i>} 
            bgColor="red"
            title="Total Sales"
            value={<span className="text-md">{totalSales.toFixed(2)}</span>}
          />
        </div>
        <div className="mt-10 flex justify-center">
          <label htmlFor="months" className="mr-2 mt-2">Select a month:</label>
          <select
            id="months"
            className="p-2 border border-gray-300 rounded-lg"
            onChange={handleMonthChange}
            value={selectedMonth}
          >
            {months.map(month => (
              <option key={month.value} value={month.value}>{month.label}</option>
            ))}
          </select>
        </div>
        <div className="flex justify-around mt-10 bg-gray-100 border border-gray-300 p-2 rounded-lg">
        
          <div className='w-80 h-80'>
            <Doughnut data={doughnutChartData1} />
          </div>
          <div className='w-80 h-80'>
            <Doughnut data={doughnutChartData2} />
          </div>
          <div className="flex flex-col justify-start w-1/3 bg-white max-h-80 p-4 shadow-lg border border-gray-300 rounded-lg overflow-y-auto">
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
            <h2 className="text-lg font-semibold mb-1 mt-2 text-center">Ongoing Orders</h2>
            <div className="flex justify-between items-center p-4 my-2 bg-yellow-500 rounded-lg shadow-md font-extrabold">
              <span className="text-sm text-center">Order #</span>
              <span className="text-sm text-center">Staff Name</span>
            </div>
            <ul>
              {Object.entries(orders).map(([orderNumber, order]) => (
                <li key={orderNumber} className="flex justify-between items-center p-4 my-4 bg-white rounded-lg shadow-md">
                  <span className="text-sm font-semibold">{orderNumber}</span>
                  <span className="text-sm">{order.StaffName}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;