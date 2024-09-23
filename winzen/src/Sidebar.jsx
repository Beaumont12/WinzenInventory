import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import logo from './assets/images/logo1.png';
import { AiFillDashboard } from 'react-icons/ai'; // Dashboard
import { BsFillClipboardCheckFill } from 'react-icons/bs'; // Orders
import { FiGrid } from 'react-icons/fi'; // Manage Categories
import { HiOutlinePlusCircle } from 'react-icons/hi'; // Add Category
import { MdSwapHoriz } from 'react-icons/md'; // Manage Products
import { FaPlusSquare } from 'react-icons/fa'; // Add Products
import { GiCardExchange } from 'react-icons/gi'; // Stocks
import { RiArrowDownSFill } from 'react-icons/ri'; // Drop down arrow
import { BiSolidFoodMenu } from 'react-icons/bi'; // Ingredients
import { FaUtensils } from 'react-icons/fa'; // Utensils
import { AiOutlineHistory } from 'react-icons/ai'; // Transactions
import { RiMoneyDollarBoxFill } from 'react-icons/ri'; // Sales Report
import { FaUserCog, FaUserPlus } from 'react-icons/fa'; // Manage Staff, Add Staff
import { FiLogOut } from 'react-icons/fi'; // Logout

const Sidebar = ({ handleLogout }) => {
  const [activeItem, setActiveItem] = useState(null);
  const navigate = useNavigate();
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);

  const handleLogoutClick = () => {
    handleLogout(); // Call the handleLogout function passed from props
    navigate('/'); // Redirect to login page
  };

  const handleItemClick = (itemName) => {
    setActiveItem(itemName === activeItem ? null : itemName);
  };

  const toggleInventory = () => {
    setIsInventoryOpen(!isInventoryOpen);
    
    // Automatically set "Ingredients" as active when Stocks menu opens
    if (!isInventoryOpen) {
      setActiveItem("Ingredients");
    }
  };

  const activeItemStyles = `bg-yellow-600 relative`;

  return (
    <div className="fixed left-0 top-0 bg-emerald-900 min-w-56 h-full overflow-y-auto">
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
      <div>
      <div className="p-2 flex items-center">
        <img src={logo} alt="Winzen's Cafe Logo" className="w-12 h-auto mr-2" />
        <h1 className="text-white text-lg font-bold">Winzen's Cafe</h1>
      </div>
      <h3 className="text-white text-xs ml-2 mt-3 mb-1 font-semibold opacity-65">Main Menu</h3>
      <ul className=" text-start">
        <NavLink to="/home" onClick={() => handleItemClick("Dashboard")}>
          <li 
            className={`px-4 py-2 text-white hover:bg-yellow-600 cursor-pointer font-semibold flex items-center transition duration-300 ease-in-out transform hover:scale-105 ${activeItem === "Dashboard" ? 'bg-yellow-600' : ''}`}
          >
            <AiFillDashboard className="mr-3 icon" />
            <span className="align-middle text-sm">Dashboard</span>
          </li>
        </NavLink>
        <NavLink to="/orders" onClick={() => handleItemClick("Orders")}>
          <li 
            className={`px-4 py-2 text-white hover:bg-yellow-600 cursor-pointer font-semibold flex items-center transition duration-300 ease-in-out transform hover:scale-105 ${activeItem === "Orders" ? 'bg-yellow-600' : ''}`}
          >
            <BsFillClipboardCheckFill className="mr-3 icon" />
            <span className="align-middle text-sm">Orders</span>
          </li>
        </NavLink>
        <NavLink to="/manage-category" onClick={() => handleItemClick("Manage Categories")}>
          <li 
            className={`px-4 py-2 text-white hover:bg-yellow-600 cursor-pointer font-semibold flex items-center transition duration-300 ease-in-out transform hover:scale-105 ${activeItem === "Manage Categories" ? 'bg-yellow-600' : ''}`}
          >
            <FiGrid className="mr-3 icon" />
            <span className="align-middle text-sm">Manage Categories</span>
          </li>
        </NavLink>
        <NavLink to="/add-category" onClick={() => handleItemClick("Add Category")}>
          <li 
            className={`px-4 py-2 text-white hover:bg-yellow-600 cursor-pointer font-semibold flex items-center transition duration-300 ease-in-out transform hover:scale-105 ${activeItem === "Add Category" ? 'bg-yellow-600' : ''}`}
          >
            <HiOutlinePlusCircle className="mr-3 icon" />
            <span className="align-middle text-sm">Add Category</span>
          </li>
        </NavLink>
        <NavLink to="/manage-product" onClick={() => handleItemClick("Manage Products")}>
          <li 
            className={`px-4 py-2 text-white hover:bg-yellow-600 cursor-pointer font-semibold flex items-center transition duration-300 ease-in-out transform hover:scale-105 ${activeItem === "Manage Products" ? 'bg-yellow-600' : ''}`}
          >
            <MdSwapHoriz className="mr-3 icon" />
            <span className="align-middle text-sm">Manage Products</span>
          </li>
        </NavLink>
        <NavLink to="/add-product" onClick={() => handleItemClick("Add Product")}>
          <li 
            className={`px-4 py-2 text-white hover:bg-yellow-600 cursor-pointer font-semibold flex items-center transition duration-300 ease-in-out transform hover:scale-105 ${activeItem === "Add Product" ? 'bg-yellow-600' : ''}`}
          >
            <FaPlusSquare className="mr-3 icon" />
            <span className="align-middle text-sm">Add Product</span>
          </li>
        </NavLink>
        <h3 className="text-white text-xs ml-2 mt-3 mb-1 font-semibold opacity-65">Inventory</h3>
          <li
            className={`px-4 py-2 text-white hover:bg-yellow-600 cursor-pointer font-semibold flex items-center transition duration-300 ease-in-out transform hover:scale-105 ${
              isInventoryOpen ? activeItemStyles : ''
            }`}
            onClick={toggleInventory} // Toggle Inventory section
          >
            {isInventoryOpen && <span className="active-line"></span>}
            <GiCardExchange className="mr-3 icon" />
            <span className="align-middle text-sm">Stocks</span>

            <RiArrowDownSFill 
              className={`ml-auto transition-transform ${isInventoryOpen ? 'rotate-180' : ''}`} 
            />
            {isInventoryOpen && <span className="active-circle"></span>}
          </li>

          {isInventoryOpen && ( // Show sub-links only when Inventory is open
            <ul className="ml-6 relative"> {/* Make this relative to position the circle */}
              
              {/* Vertical line */}
              <span className="absolute h-full left-0 top-0 border-l-2 border-gray-300"></span>

              {/* Moving circle on the line */}
              <span
                className={`absolute w-2.5 h-2.5 rounded-full transition-all duration-300 ease-in-out transform -translate-x-1/2 ${
                  activeItem === "Ingredients" 
                    ? 'bg-amber-400 top-4' // Circle color changes when Ingredients is active
                    : activeItem === "Utensils" 
                    ? 'bg-amber-400 top-12' // Moves circle based on the active item
                    : 'bg-amber-400 top-4' // Default circle to Ingredients if none is active
                }`}
              ></span>

              <NavLink to="/inventory/ingredients" onClick={() => handleItemClick("Ingredients")}>
                <li
                  className={`px-4 py-2.5 pl-8 cursor-pointer font-semibold flex items-center transition duration-300 ease-in-out transform hover:scale-105 ${
                    activeItem === "Ingredients" 
                      ? 'text-yellow-600' // Text color when active
                      : 'text-white' // Inactive text
                  } relative`}
                >
                  <BiSolidFoodMenu className="mr-3 icon" />
                  <span className="align-middle text-sm">Ingredients</span>
                </li>
              </NavLink>

              <NavLink to="/inventory/utensils" onClick={() => handleItemClick("Utensils")}>
                <li
                  className={`px-4 py-1.5 pl-8 cursor-pointer font-semibold flex items-center transition duration-300 ease-in-out transform hover:scale-105 ${
                    activeItem === "Utensils" 
                      ? 'text-yellow-600' // Text color when active
                      : 'text-white' // Inactive text
                  } relative`}
                >
                  <FaUtensils className="mr-3 icon" />
                  <span className="align-middle text-sm">Utensils</span>
                </li>
              </NavLink>
            </ul>
          )}

        <h3 className="text-white text-xs ml-2 mt-3 mb-1 font-semibold opacity-65">Reports</h3>
        <NavLink to="/transactions" onClick={() => handleItemClick("Transactions")}>
          <li 
            className={`px-4 py-2 text-white hover:bg-yellow-600 cursor-pointer font-semibold flex items-center transition duration-300 ease-in-out transform hover:scale-105 ${activeItem === "Transactions" ? 'bg-yellow-600' : ''}`}
          >
            <AiOutlineHistory className="mr-3 icon" />
            <span className="align-middle text-sm">Transactions</span>
          </li>
        </NavLink>
        <NavLink to="/sales-report" onClick={() => handleItemClick("Sales Report")}>
          <li 
            className={`px-4 py-2 text-white hover:bg-yellow-600 cursor-pointer font-semibold flex items-center transition duration-300 ease-in-out transform hover:scale-105 ${activeItem === "Sales Report" ? 'bg-yellow-600' : ''}`}
          >
            <RiMoneyDollarBoxFill className="mr-3 icon" />
            <span className="align-middle text-sm">Sales Report</span>
          </li>
        </NavLink>
        <h3 className="text-white text-xs ml-2 mt-3 mb-1 font-semibold opacity-65">Users</h3>
        <NavLink to="/manage-users" onClick={() => handleItemClick("Manage Staffs")}>
          <li 
            className={`px-4 py-2 text-white hover:bg-yellow-600 cursor-pointer font-semibold flex items-center transition duration-300 ease-in-out transform hover:scale-105 ${activeItem === "Manage Staffs" ? 'bg-yellow-600' : ''}`}
          >
            <FaUserCog className="mr-3 icon" />
            <span className="align-middle text-sm">Manage Staffs</span>
          </li>
        </NavLink>
        <NavLink to="/add-users" onClick={() => handleItemClick("Add Staffs")}>
          <li 
            className={`px-4 py-2 text-white hover:bg-yellow-600 cursor-pointer font-semibold flex items-center transition duration-300 ease-in-out transform hover:scale-105 ${activeItem === "Add Staffs" ? 'bg-yellow-600' : ''}`}
          >
            <FaUserPlus className="mr-3 icon" />
            <span className="align-middle text-sm">Add Staffs</span>
          </li>
        </NavLink>
      </ul>
    </div>
    <div>
      <button className="text-white text-sm bg-yellow-800 mt-16 mb-1 font-semibold px-1 py-2 border border-yellow-600 w-full flex items-center justify-center" onClick={handleLogoutClick}>
        <FiLogOut className="mr-2 text-sm" /> {/* Icon */}
        Logout
      </button>
    </div>
    </div>
  );
};

export default Sidebar;