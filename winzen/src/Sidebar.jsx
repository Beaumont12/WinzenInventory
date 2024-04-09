import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import logo from './assets/images/logo1.png'
import { FaSignOutAlt, FaChartBar, FaClipboardList, FaTasks, FaPlusSquare, FaExchangeAlt,FaUserCog, FaMoneyCheckAlt, FaUserPlus, FaHistory } from 'react-icons/fa'; // Import SVG icons from react-icons

const Sidebar = ({ handleLogout }) => {
  const [activeItem, setActiveItem] = useState(null);
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    handleLogout(); // Call the handleLogout function passed from props
    navigate('/'); // Redirect to login page
  };

  const handleItemClick = (itemName) => {
    setActiveItem(itemName === activeItem ? null : itemName);
  };

  return (
    <div className="fixed left-0 top-0 bg-emerald-900 w-55 h-full overflow-y-auto">
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
      <div>
      <div className="p-2 flex items-center">
        <img src={logo} alt="Winzen's Cafe Logo" className="w-12 h-auto mr-2" />
        <h1 className="text-white text-xl font-bold">Winzen's Cafe</h1>
      </div>
      <h3 className="text-white text-sm ml-2 mt-3 mb-1 font-semibold opacity-65">Main Menu</h3>
      <ul className=" text-start">
        <NavLink to="/home" onClick={() => handleItemClick("Dashboard")}>
          <li 
            className={`px-4 py-2 text-white hover:bg-yellow-600 cursor-pointer font-semibold flex items-center transition duration-300 ease-in-out transform hover:scale-105 ${activeItem === "Dashboard" ? 'bg-yellow-600' : ''}`}
          >
            <FaChartBar className="mr-3 icon" />
            <span className="align-middle">Dashboard</span>
          </li>
        </NavLink>
        <NavLink to="/orders" onClick={() => handleItemClick("Orders")}>
          <li 
            className={`px-4 py-2 text-white hover:bg-yellow-600 cursor-pointer font-semibold flex items-center transition duration-300 ease-in-out transform hover:scale-105 ${activeItem === "Orders" ? 'bg-yellow-600' : ''}`}
          >
            <FaClipboardList className="mr-3 icon" />
            <span className="align-middle">Orders</span>
          </li>
        </NavLink>
        <NavLink to="/manage-category" onClick={() => handleItemClick("Manage Categories")}>
          <li 
            className={`px-4 py-2 text-white hover:bg-yellow-600 cursor-pointer font-semibold flex items-center transition duration-300 ease-in-out transform hover:scale-105 ${activeItem === "Manage Categories" ? 'bg-yellow-600' : ''}`}
          >
            <FaTasks className="mr-3 icon" />
            <span className="align-middle">Manage Categories</span>
          </li>
        </NavLink>
        <NavLink to="/add-category" onClick={() => handleItemClick("Add Category")}>
          <li 
            className={`px-4 py-2 text-white hover:bg-yellow-600 cursor-pointer font-semibold flex items-center transition duration-300 ease-in-out transform hover:scale-105 ${activeItem === "Add Category" ? 'bg-yellow-600' : ''}`}
          >
            <FaPlusSquare className="mr-3 icon" />
            <span className="align-middle">Add Category</span>
          </li>
        </NavLink>
        <NavLink to="/manage-product" onClick={() => handleItemClick("Manage Products")}>
          <li 
            className={`px-4 py-2 text-white hover:bg-yellow-600 cursor-pointer font-semibold flex items-center transition duration-300 ease-in-out transform hover:scale-105 ${activeItem === "Manage Products" ? 'bg-yellow-600' : ''}`}
          >
            <FaExchangeAlt className="mr-3 icon" />
            <span className="align-middle">Manage Products</span>
          </li>
        </NavLink>
        <NavLink to="/add-product" onClick={() => handleItemClick("Add Product")}>
          <li 
            className={`px-4 py-2 text-white hover:bg-yellow-600 cursor-pointer font-semibold flex items-center transition duration-300 ease-in-out transform hover:scale-105 ${activeItem === "Add Product" ? 'bg-yellow-600' : ''}`}
          >
            <FaPlusSquare className="mr-3 icon" />
            <span className="align-middle">Add Product</span>
          </li>
        </NavLink>
        <h3 className="text-white text-sm ml-2 mt-3 mb-1 font-semibold opacity-65">Reports</h3>
        <NavLink to="/transactions" onClick={() => handleItemClick("Transactions")}>
          <li 
            className={`px-4 py-2 text-white hover:bg-yellow-600 cursor-pointer font-semibold flex items-center transition duration-300 ease-in-out transform hover:scale-105 ${activeItem === "Transactions" ? 'bg-yellow-600' : ''}`}
          >
            <FaHistory className="mr-3 icon" />
            <span className="align-middle">Transactions</span>
          </li>
        </NavLink>
        <NavLink to="/sales-report" onClick={() => handleItemClick("Sales Report")}>
          <li 
            className={`px-4 py-2 text-white hover:bg-yellow-600 cursor-pointer font-semibold flex items-center transition duration-300 ease-in-out transform hover:scale-105 ${activeItem === "Sales Report" ? 'bg-yellow-600' : ''}`}
          >
            <FaMoneyCheckAlt className="mr-3 icon" />
            <span className="align-middle">Sales Report</span>
          </li>
        </NavLink>
        <h3 className="text-white text-sm ml-2 mt-3 mb-1 font-semibold opacity-65">Users</h3>
        <NavLink to="/manage-users" onClick={() => handleItemClick("Manage Staffs")}>
          <li 
            className={`px-4 py-2 text-white hover:bg-yellow-600 cursor-pointer font-semibold flex items-center transition duration-300 ease-in-out transform hover:scale-105 ${activeItem === "Manage Staffs" ? 'bg-yellow-600' : ''}`}
          >
            <FaUserCog className="mr-3 icon" />
            <span className="align-middle">Manage Staffs</span>
          </li>
        </NavLink>
        <NavLink to="/add-users" onClick={() => handleItemClick("Add Staffs")}>
          <li 
            className={`px-4 py-2 text-white hover:bg-yellow-600 cursor-pointer font-semibold flex items-center transition duration-300 ease-in-out transform hover:scale-105 ${activeItem === "Add Staffs" ? 'bg-yellow-600' : ''}`}
          >
            <FaUserPlus className="mr-3 icon" />
            <span className="align-middle">Add Staffs</span>
          </li>
        </NavLink>
      </ul>
    </div>
    <div>
      <button className="text-white text-sm bg-yellow-800 mt-16 mb-1 font-semibold px-1 py-2 border border-yellow-600 w-full flex items-center justify-center" onClick={handleLogoutClick}>
        <FaSignOutAlt className="mr-2" /> {/* Icon */}
        Logout
      </button>
    </div>
    </div>
  );
};

export default Sidebar;