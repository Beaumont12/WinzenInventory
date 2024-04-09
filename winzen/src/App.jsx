import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from '../src/homepage/Home';
import LoginPage from './loginpage/LoginPage';
import History from './historypage/History';
import Managecategory from './categorypage/Managecategory';
import Manageorder from './orderspage/Manageorder';
import Addcategory from './categorypage/Addcategory';
import Manageproducts from './productspage/Manageproducts';
import Addproducts from './productspage/Addproducts';
import Overallsale from './salespage/Overallsale';
import Manageuser from './userspage/Manageuser';
import Adduser from './userspage/Adduser';
import Layout from './Layout'; // Import the Layout component

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    // Read isLoggedIn from local storage on initial mount
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  // Function to handle login
  const handleLogin = () => {
    // Perform login logic
    localStorage.setItem('isLoggedIn', 'true');
    setIsLoggedIn(true); // Update isLoggedIn state
  };

  // Function to handle logout
  const handleLogout = () => {
    // Perform logout logic
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
  };

  useEffect(() => {
    // Check if user is logged in on initial mount
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);
  }, []);

  // Function to render routes based on login status
  const renderRoutes = () => {
    if (isLoggedIn) {
      return (
        <>
          <Route path="/home" element={<Layout handleLogout={handleLogout}><Home /></Layout>} />
          <Route path="/orders" element={<Layout handleLogout={handleLogout}><Manageorder /></Layout>} />
          <Route path="/manage-category" element={<Layout handleLogout={handleLogout}><Managecategory /></Layout>} />
          <Route path="/add-category" element={<Layout handleLogout={handleLogout}><Addcategory /></Layout>} />
          <Route path="/manage-product" element={<Layout handleLogout={handleLogout}><Manageproducts /></Layout>} />
          <Route path="/add-product" element={<Layout handleLogout={handleLogout}><Addproducts /></Layout>} />
          <Route path="/sales-report" element={<Layout handleLogout={handleLogout}><Overallsale /></Layout>} />
          <Route path="/manage-users" element={<Layout handleLogout={handleLogout}><Manageuser /></Layout>} />
          <Route path="/transactions" element={<Layout handleLogout={handleLogout}><History /></Layout>} />
          <Route path="/add-users" element={<Layout handleLogout={handleLogout}><Adduser /></Layout>} />
          <Route path="/" element={<Navigate to="/home" />} /> {/* Redirect to /home if already logged in */}
        </>
      );
    } else {
      return (
        <>
          <Route path="/" element={<LoginPage handleLogin={handleLogin} />} />
          {/* Fallback route to redirect to login page if not logged in */}
          <Route path="*" element={<Navigate to="/" />} />
        </>
      );
    }
  };

  return (
    <Router>
      <Routes>
        {renderRoutes()}
      </Routes>
    </Router>
  );
}

export default App;