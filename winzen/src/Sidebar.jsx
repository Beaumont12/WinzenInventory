import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaChartBar, FaClipboardList, FaListAlt, FaPlusSquare, FaExchangeAlt, FaMoneyCheckAlt, FaUserCog, FaHistory, FaTasks } from 'react-icons/fa'; // Import SVG icons from react-icons

const Sidebar = () => {
  return (
    <div className="fixed left-0 top-0 bg-emerald-950 w-60 h-full">
      <div className="p-4">
        <h1 className="text-white text-xl mt-3 font-bold">Relgin Paloma</h1>
      </div>
      <ul className="py-4 text-start">
        <li className="px-4 py-2 text-white hover:bg-emerald-800 cursor-pointer font-semibold flex items-center transition duration-300 ease-in-out transform hover:scale-105">
          <NavLink to="/home" className="flex items-center">
            <FaChartBar className="mr-3 icon" />
            <span className="align-middle">Dashboard</span>
          </NavLink>
        </li>
        <li className="px-4 py-2 text-white hover:bg-emerald-800 cursor-pointer font-semibold flex items-center transition duration-300 ease-in-out transform hover:scale-105">
          <NavLink to="/orders" className="flex items-center">
            <FaClipboardList className="mr-3 icon" />
            <span className="align-middle">Orders</span>
          </NavLink>
        </li>
        <li className="px-4 py-2 text-white hover:bg-emerald-800 cursor-pointer font-semibold flex items-center transition duration-300 ease-in-out transform hover:scale-105">
          <NavLink to="/manage-category" className="flex items-center">
            <FaTasks className="mr-3 icon" />
            <span className="align-middle">Manage Categories</span>
          </NavLink>
        </li>
        <li className="px-4 py-2 text-white hover:bg-emerald-800 cursor-pointer font-semibold flex items-center transition duration-300 ease-in-out transform hover:scale-105">
          <NavLink to="/add-category" className="flex items-center">
            <FaPlusSquare className="mr-3 icon" />
            <span className="align-middle">Add Category</span>
          </NavLink>
        </li>
        <li className="px-4 py-2 text-white hover:bg-emerald-800 cursor-pointer font-semibold flex items-center transition duration-300 ease-in-out transform hover:scale-105">
          <NavLink to="/manage-product" className="flex items-center">
            <FaExchangeAlt className="mr-3 icon" />
            <span className="align-middle">Manage Products</span>
          </NavLink>
        </li>
        <li className="px-4 py-2 text-white hover:bg-emerald-800 cursor-pointer font-semibold flex items-center transition duration-300 ease-in-out transform hover:scale-105">
          <NavLink to="/add-product" className="flex items-center">
            <FaPlusSquare className="mr-3 icon" />
            <span className="align-middle">Add Product</span>
          </NavLink>
        </li>
        <hr className="my-4 mx-4 border border-white" />
        <li className="px-4 py-2 text-white hover:bg-emerald-800 cursor-pointer font-semibold flex items-center transition duration-300 ease-in-out transform hover:scale-105">
          <NavLink to="/transactions" className="flex items-center">
            <FaHistory className="mr-3 icon" />
            <span className="align-middle">Transactions</span>
          </NavLink>
        </li>
        <li className="px-4 py-2 text-white hover:bg-emerald-800 cursor-pointer font-semibold flex items-center transition duration-300 ease-in-out transform hover:scale-105">
          <NavLink to="/sales-report" className="flex items-center">
            <FaMoneyCheckAlt className="mr-3 icon" />
            <span className="align-middle">Sales Report</span>
          </NavLink>
        </li>
        <hr className="my-4 mx-4 border border-white" />
        <li className="px-4 py-2 text-white hover:bg-emerald-800 cursor-pointer font-semibold flex items-center transition duration-300 ease-in-out transform hover:scale-105">
          <NavLink to="/manage-users" className="flex items-center">
            <FaUserCog className="mr-3 icon" />
            <span className="align-middle">Manage Users</span>
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;