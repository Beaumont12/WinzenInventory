import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get } from 'firebase/database';
import logo from '../assets/images/logo.png';
import Calendar from 'react-calendar'; // Import calendar library
import 'react-calendar/dist/Calendar.css'; // Import calendar styles

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

const months = ['Overall', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const Overallsale = () => {
  const [chartData, setChartData] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(months[0]);
  const [selectedWeek, setSelectedWeek] = useState('Overall');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [error, setError] = useState(null);
  const [calendarActive, setCalendarActive] = useState(false);
  const [totalSalesForWeek, setTotalSalesForWeek] = useState(0); // State to hold total sales for the selected week
  const [totalQuantitySold, setTotalQuantitySold] = useState(0); // State to hold total quantity sold for the selected week
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalWeeksInMonth, setTotalWeeksInMonth] = useState(0); // State to hold total number of weeks in the selected month

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedWeek, selectedDate, calendarActive]);

  useEffect(() => {
    // Calculate total weeks in the selected month
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const weeksInMonth = calculateWeeksInMonth(year, month);
    setTotalWeeksInMonth(weeksInMonth);
  }, [selectedDate]);

  const fetchData = async () => {
    try {
      const historyRef = ref(db, 'history');
      const snapshot = await get(historyRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        let filteredData = Object.values(data);
  
        if (!calendarActive) {
          if (selectedMonth !== 'Overall') {
            filteredData = filteredData.filter(item => {
              const orderDate = new Date(item.orderDateTime);
              return months[orderDate.getMonth() + 1] === selectedMonth;
            });
          }
          if (selectedWeek !== 'Overall') {
            const selectedYear = selectedDate.getFullYear();
            const monthIndex = months.indexOf(selectedMonth) - 1;
            const selectedWeekNumber = parseInt(selectedWeek) - 1; // Adjusted to start from 0 for the first week of the month
            
            // Calculate the start date of the month
            const firstDayOfMonth = new Date(selectedYear, monthIndex, 1);
            
            // Calculate the start date of the selected week
            let firstDayOfWeek = new Date(firstDayOfMonth);
            firstDayOfWeek.setDate(firstDayOfMonth.getDate() + (selectedWeekNumber * 7)); // Corrected calculation
            firstDayOfWeek.setHours(0, 0, 0, 0); // Set time to 00:00:00
        
            // Calculate the end date of the week (Sunday)
            let lastDayOfWeek = new Date(firstDayOfWeek);
            lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
            lastDayOfWeek.setHours(23, 59, 59, 999); // Set time to 23:59:59.999
        
            // Ensure the end date is within the selected month
            if (lastDayOfWeek.getMonth() !== monthIndex) {
                // If the end date is not within the selected month, set it to the last day of the selected month
                lastDayOfWeek = new Date(selectedYear, monthIndex + 1, 0); // Set to last day of previous month
            }
        
            console.log('Start date of week:', firstDayOfWeek);
            console.log('End date of week:', lastDayOfWeek);
        
            // Filter the data based on the dates within the selected week
            console.log("Filtered data before filtering:", filteredData);
        
            filteredData = filteredData.filter(item => {
                const orderDate = new Date(item.orderDateTime);
                const isInWeekRange = orderDate >= firstDayOfWeek && orderDate <= lastDayOfWeek;
                console.log("Order date:", orderDate.toDateString());
                console.log("Is in week range?", isInWeekRange);
                return isInWeekRange;
            });
        
            console.log("Filtered data after filtering:", filteredData);
        }
             
        } else {
          const selectedYear = selectedDate.getFullYear();
          const selectedMonth = selectedDate.getMonth();
          const selectedDay = selectedDate.getDate();
          // Filter the data based on the selected date
          filteredData = filteredData.filter(item => {
            const orderDate = new Date(item.orderDateTime);
            // Adjust the orderDate to match the selected date's time zone
            return (
              orderDate.getFullYear() === selectedYear &&
              orderDate.getMonth() === selectedMonth &&
              orderDate.getDate() === selectedDay
            );
          });          
        }
        
        console.log('Filtered data:', filteredData);
  
        // Initialize an object to store sales data for each date within the selected week
        const staffData = {};
  
        // Process the filtered data and aggregate sales data for each date
        filteredData.forEach((item) => {
          const { staffName, orderItems, total, customerName, orderDateTime } = item;
          if (!staffData[staffName]) {
            staffData[staffName] = { totalSales: 0, totalQuantity: 0, totalCustomers: 0, customers: [] };
          }
          staffData[staffName].totalSales += total;
          Object.values(orderItems).forEach((order) => {
            staffData[staffName].totalQuantity += order.quantity;
          });
          if (customerName && !staffData[staffName].customers.includes(customerName)) {
            staffData[staffName].totalCustomers++;
            staffData[staffName].customers.push(customerName);
          }
        });
        // Calculate overall totals
        const overallTotalSales = Object.values(staffData).reduce((acc, curr) => acc + curr.totalSales, 0);
        const overallTotalQuantity = Object.values(staffData).reduce((acc, curr) => acc + curr.totalQuantity, 0);
        const overallTotalCustomers = Object.values(staffData).reduce((acc, curr) => acc + curr.totalCustomers, 0);

        // Set the overall totals state variables
        setTotalSalesForWeek(overallTotalSales);
        setTotalQuantitySold(overallTotalQuantity);
        setTotalCustomers(overallTotalCustomers);
  
        // Convert the aggregated data into the format required by Chart.js
        const labels = Object.keys(staffData);
        const dataset1Data = labels.map(date => staffData[date].totalSales);
        const dataset2Data = labels.map(date => staffData[date].totalQuantity);
        const dataset3Data = labels.map(date => staffData[date].totalCustomers);
  
        setChartData({
          labels: labels,
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
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
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

  const calculateWeeksInMonth = (year, month) => {
    const firstDayOfMonth = new Date(year, month, 1);
    const firstDayOfWeek = firstDayOfMonth.getDay(); // Sunday: 0, Monday: 1, ..., Saturday: 6
    const daysInMonth = new Date(year, month + 1, 0).getDate(); // Total days in the month
    const daysLeftInFirstWeek = 7 - (firstDayOfWeek === 0 ? 7 : firstDayOfWeek); // Days left in the first week
    const remainingDays = daysInMonth - daysLeftInFirstWeek; // Remaining days after the first week
    const fullWeeks = Math.ceil(remainingDays / 7); // Number of full weeks in the month
    return fullWeeks + 1; // Add 1 to include the first week
};


  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
    setSelectedWeek('Overall'); // Reset selected week when month changes
    setCalendarActive(false); // Deactivate calendar mode when dropdown is used
  };

  const handleWeekChange = (e) => {
    setSelectedWeek(e.target.value);
    setCalendarActive(false); // Deactivate calendar mode when dropdown is used
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setCalendarActive(true); // Activate calendar mode when calendar is used
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Sales Overview' },
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
        <h1 className="text-6xl text-center mt-2 font-bold text-black">Sales Report</h1>
        <h3 className="text-lg md:text-base bg-teal-800 text-gray-200 mb-6 text-center mt-4 md:mt-8 font-semibold">
          ENJOY BROWSING
        </h3>
        <div className="flex justify-center mb-4">
          <label htmlFor="months" className="mr-2 mt-2">Select a month:</label>
          <select
            value={selectedMonth}
            onChange={handleMonthChange}
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {months.map((month, index) => (
              <option key={index} value={month}>{month}</option>
            ))}
          </select>
          {/* Add second dropdown for selecting week */}
          <select
            value={selectedWeek}
            onChange={handleWeekChange}
            className="ml-2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Overall">Overall</option>
            {/* Dynamically generate week options */}
            {selectedMonth !== 'Overall' && [...Array(totalWeeksInMonth)].map((_, index) => (
              <option key={index} value={index + 1}>{`Week ${index + 1}`}</option>
            ))}
          </select>
        </div>
        <div className="flex justify-center mb-4">
          <Calendar
            onChange={handleDateChange}
            value={selectedDate}
          />
        </div>
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
                  <div className="mt-4">
                    <div className="bg-red-200 p-4 rounded-lg shadow">
                      <p className="text-lg font-semibold">Total Sales for {selectedMonth} - {selectedWeek}</p>
                      <p className="text-sm">&#8369;{totalSalesForWeek}</p>
                    </div>
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
                  <div className="mt-4">
                    <div className="bg-yellow-200 p-4 rounded-lg shadow">
                      <p className="text-lg font-semibold">Total Quantity Sold for {selectedMonth} - {selectedWeek}</p>
                      <p className="text-sm">{totalQuantitySold}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="bg-purple-200 p-4 rounded-lg shadow">
                      <p className="text-lg font-semibold">Total Customers for {selectedMonth} - {selectedWeek}</p>
                      <p className="text-sm">{totalCustomers}</p>
                    </div>
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