import React, { useState } from 'react';
import BGgreen from '../assets/images/bg1.jpg';
import logo from '../assets/images/logo.png';
import { useNavigate } from 'react-router-dom';
import { getDatabase, ref, get } from 'firebase/database';
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

const LoginPage = (props) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigateTo = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const database = getDatabase(); // Get a reference to the Firebase Realtime Database
      const userRef = ref(database, `admin/${username}`); // Reference to the user in the database

      const snapshot = await get(userRef); // Get the user data from the database
      const userData = snapshot.val();

      if (userData && userData.password === password) {
        // Login successful
        console.log('Logged in successfully');
        props.handleLogin(); // Call handleLogin function from props
        navigateTo('/home');// Redirect to home page
      } else {
        setError('Invalid username or password');
      }
    } catch (error) {
      setError('Error logging in: ' + error.message);
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-cover" style={{ backgroundImage: `url(${BGgreen})` }}>
      {/* Login Form */}
      <div className="max-w-xl w-full p-8 bg-white bg-opacity-70 rounded-xl shadow-lg md:mx-auto lg:ml-40">
        <div className="flex flex-col justify-between items-center h-full">
          {/* Empty div to push content to the top */}
          <div></div>
          
          {/* Logo */}
          <div className="flex flex-col items-center">
            <img src={logo} alt="Logo" className="w-24 h-24 mb-2" />
            <h2 className="text-3xl font-bold text-center text-emerald-900 mb-2">Winzen's Cafe</h2>
          </div>
          
          <h2 className="text-xs font-bold text-center text-emerald-800 mb-4">Login to your account</h2>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label htmlFor="username" className="sr-only">Username:</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                id="username"
                name="username"
                type="text"
                autoComplete="text"
                required
                className="w-full px-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Admin ID"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="sr-only">Password:</label>
              <input
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full px-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Password"
              />
            </div>
            <div>
              <button
                type="submit"
                className="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-700 hover:bg-emerald-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Log in
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;