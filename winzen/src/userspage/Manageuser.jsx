import React, { useState, useEffect } from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/solid';
import { getDatabase, ref, get, onValue, update, remove } from 'firebase/database';
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

const Manageuser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null); // State variable to track the ID of the user to delete
  const [updatedUserData, setUpdatedUserData] = useState({
    Name: '',
    Email: '',
    Age: '',
    Phone: '',
    Birthday: {
      Date: '',
      Month: '',
      Year: ''
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const db = getDatabase();
        const usersRef = ref(db, 'staffs');
        onValue(usersRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const usersArray = Object.entries(data).map(([id, user]) => ({
              id,
              ...user,
            }));
            setUsers(usersArray);
            setLoading(false);
          }
        });
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEditClick = (user) => {
    setEditingUser(user);
    setUpdatedUserData({
      ...user,
      Birthday: {
        ...user.Birthday
      }
    });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingUser(null);
    setUpdatedUserData({
      Name: '',
      Email: '',
      Age: '',
      Phone: '',
      Birthday: {
        Date: '',
        Month: '',
        Year: ''
      }
    });
    setModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("Birthday")) {
      const birthdayField = name.split(".")[1];
      setUpdatedUserData(prevState => ({
        ...prevState,
        Birthday: {
          ...prevState.Birthday,
          [birthdayField]: parseInt(value, 10)
        }
      }));
    } else {
      setUpdatedUserData({ ...updatedUserData, [name]: value });
    }
  };

  const handleDeleteClick = (userId) => {
    setDeleteUserId(userId); // Set the ID of the user to be deleted
  };

  const confirmDeleteUser = () => {
    const db = getDatabase();
    const userRef = ref(db, `staffs/${deleteUserId}`);
    remove(userRef)
      .then(() => {
        // Remove the user from the local state
        setUsers(users.filter(user => user.id !== deleteUserId));
        setDeleteUserId(null); // Reset deleteUserId state
      })
      .catch((error) => {
        console.error('Error deleting user:', error);
      });
  };
  
  const handleSaveChanges = () => {
    // Validate if any required field is empty or undefined
      // Debugging: Log updatedUserData object
    console.log('Updated user data:', updatedUserData);
  
    const db = getDatabase();
    const userRef = ref(db, `staffs/${editingUser.id}`);
    update(userRef, {
      Name: updatedUserData.Name,
      Email: updatedUserData.Email,
      Age: updatedUserData.Age,
      Phone: updatedUserData.Phone,
      Birthday: {
        Date: updatedUserData.Birthday.Date,
        Month: updatedUserData.Birthday.Month,
        Year: updatedUserData.Birthday.Year
      }
    }).then(() => {
      // Update the user locally
      setUsers(users.map(user => {
        if (user.id === editingUser.id) {
          return { ...user, ...updatedUserData };
        }
        return user;
      }));
      handleCloseModal();
    }).catch((error) => {
      console.error('Error updating user:', error);
    });
  };

  return (
    <div>
      <div className="flex-1 bg-white bg-cover bg-center bg-no-repeat h-screen">
        <style>
          {/* Scrollbar styling */}
        </style>
        <div className="p-4">
          <h1 className="text-6xl text-center mt-2 font-bold">Manage Users</h1>
          <h3 className="text-lg md:text-base text-center text-gray-200 mt-4 md:mt-8 font-semibold bg-teal-800">EDIT ONLY WHEN NECESSARY</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-8 border border-gray-300 rounded-lg shadow-lg">
            {loading ? (
              <p>Loading...</p>
            ) : (
              users.map((user) => (
                <div key={user.id} className="max-w-md w-full mx-4 my-4 bg-gray-200 rounded-lg shadow-md overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-center">
                      <div className="w-[56px] h-[56px] rounded-full mr-4 bg-cover" style={{ backgroundImage: `url(${user.ImageUrl})` }} />
                      <div>
                        <h2 className="text-lg text-black font-semibold">{user.Name}</h2>
                        <p className="text-sm text-gray-800 opacity-60">{user.Email}</p>
                      </div>
                    </div>
                    <p className="mt-4 text-black">ID: {user.id}</p>
                    <p className="text-sm text-gray-800 opacity-80">Age: {user.Age}</p>
                    <p className="text-sm text-gray-800 opacity-80">Phone: {user.Phone}</p>
                    <p className="text-sm text-gray-800 opacity-80">Birthday: {user.Birthday.Month}/{user.Birthday.Date}/{user.Birthday.Year}</p>
                    <div className="mt-4 flex justify-end">
                      <button onClick={() => handleEditClick(user)} className="mr-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        <PencilIcon className="h-5 w-5 text-white" /> {/* Edit Icon */}
                      </button>
                      <button onClick={() => handleDeleteClick(user.id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                        <TrashIcon className="h-5 w-5 text-white" /> {/* Delete Icon */}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      {/* Confirmation dialogue */}
      {deleteUserId && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <div className="relative bg-white rounded-lg overflow-hidden max-w-md w-full">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Confirm Delete</h2>
                <p className="text-gray-700">Are you sure you want to delete this user?</p>
                <div className="mt-4 flex justify-end">
                  <button onClick={() => setDeleteUserId(null)} className="mr-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded">
                    Cancel
                  </button>
                  <button onClick={confirmDeleteUser} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal for editing user */}
      {modalOpen && editingUser && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <div className="relative bg-white rounded-lg overflow-hidden max-w-md w-full">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Edit User</h2>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Name</label>
                  <input type="text" name="Name" value={updatedUserData.Name} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                  <input type="text" name="Email" value={updatedUserData.Email} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Age</label>
                  <input type="number" name="Age" value={updatedUserData.Age} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Phone</label>
                  <input type="number" name="Phone" value={updatedUserData.Phone} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Birthday</label>
                  <div className="grid grid-cols-3 gap-2">
                    <input type="number" name="Birthday.Month" placeholder="Month" value={updatedUserData.Birthday.Month} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                    <input type="number" name="Birthday.Date" placeholder="Date" value={updatedUserData.Birthday.Date} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                    <input type="number" name="Birthday.Year" placeholder="Year" value={updatedUserData.Birthday.Year} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button onClick={handleCloseModal} className="mr-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded">
                    Cancel
                  </button>
                  <button onClick={handleSaveChanges} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Manageuser;