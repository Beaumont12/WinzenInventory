import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from '../src/homepage/Home';
import LoginPage from './loginpage/LoginPage';
import History from './historypage/History'
import Managecategory from './categorypage/Managecategory';
import Manageorder from './orderspage/Manageorder';
import Addcategory from './categorypage/Addcategory';
import Manageproducts from './productspage/Manageproducts';
import Addproducts from './productspage/Addproducts';
import Overallsale from './salespage/Overallsale';
import Manageuser from './userspage/Manageuser';
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
    setIsLoggedIn(false); // Update isLoggedIn state
  };

  return (
    <Router>
      <Routes>
        {/* If isLoggedIn is true, redirect to the Home page, otherwise render the LoginPage */}
        <Route path="/" element={isLoggedIn ? <Navigate to="/home" /> : <LoginPage handleLogin={handleLogin} />} />

        {/* Use Layout component for routes that need a sidebar */}
        <Route
          path="/home"
          element={
            isLoggedIn ? (
              <Layout>
                <Home />
              </Layout>
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/orders"
          element={
            isLoggedIn ? (
              <Layout>
                <Manageorder />
              </Layout>
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/manage-category"
          element={
            isLoggedIn ? (
              <Layout>
                <Managecategory />
              </Layout>
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/add-category"
          element={
            isLoggedIn ? (
              <Layout>
                <Addcategory />
              </Layout>
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/manage-product"
          element={
            isLoggedIn ? (
              <Layout>
                <Manageproducts />
              </Layout>
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/add-product"
          element={
            isLoggedIn ? (
              <Layout>
                <Addproducts />
              </Layout>
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/sales-report"
          element={
            isLoggedIn ? (
              <Layout>
                <Overallsale />
              </Layout>
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/manage-users"
          element={
            isLoggedIn ? (
              <Layout>
                <Manageuser />
              </Layout>
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/transactions"
          element={
            isLoggedIn ? (
              <Layout>
                <History />
              </Layout>
            ) : (
              <Navigate to="/" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;