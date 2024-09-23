import React, { useState, useRef, useEffect } from 'react';
import { getDatabase, ref, set, get } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { initializeApp } from 'firebase/app';
import emailjs from 'emailjs-com';

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
const storage = getStorage(app);

const Adduser = () => {
  const [userData, setUserData] = useState({
    Name: '',
    Email: '',
    Age: '',
    Phone: '',
    Birthday: {
      Date: '',
      Month: '',
      Year: ''
    },
    ImageUrl: '',
    Password: '',
    Role: ''
  });

  const [showConfirmation, setShowConfirmation] = useState(false);
  const form = useRef();
  const [staffCount, setStaffCount] = useState(0);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [roleOptions] = useState(["Admin", "Barista", "Cashier"]); // Define role options

  useEffect(() => {
    const db = getDatabase();
    const countRef = ref(db, 'staffCount');
    get(countRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const count = snapshot.val();
          setStaffCount(count);
        }
      })
      .catch((error) => {
        console.error('Error getting count:', error);
      });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("Birthday")) {
      const birthdayField = name.split(".")[1];
      setUserData(prevState => ({
        ...prevState,
        Birthday: {
          ...prevState.Birthday,
          [birthdayField]: value
        }
      }));
    } else {
      setUserData({ ...userData, [name]: value });
    }
  };

  const handleImageUpload = (imageFile, staffName) => {
    const fileName = `${staffName}_${imageFile.name}`;
    const storageRefPath = storageRef(storage, `images/${fileName}`);
    return uploadBytes(storageRefPath, imageFile)
      .then((snapshot) => {
        console.log('Image uploaded successfully');
        return getDownloadURL(snapshot.ref);
      })
      .catch((error) => {
        console.error('Error uploading image:', error);
        throw error;
      });
  };  

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if any required fields are empty
    if (!userData.Name.trim() || !userData.Email.trim() || !userData.Age.trim() || !userData.Phone.trim() || !userData.Birthday.Date.trim() || !userData.Birthday.Month.trim() || !userData.Birthday.Year.trim() || !e.target.image.files[0] || !userData.Password.trim() || !userData.Role.trim()) {
      showAlertMessage('Please fill in all fields');
      return;
    }

    try {
      const db = getDatabase();
      const imageUrl = await handleImageUpload(e.target.image.files[0], userData.Name);

      const age = parseInt(userData.Age);
      const phone = parseInt(userData.Phone);
      const birthday = {
        Date: parseInt(userData.Birthday.Date),
        Month: parseInt(userData.Birthday.Month),
        Year: parseInt(userData.Birthday.Year)
      };

      const updatedUserData = {
        ...userData,
        ImageUrl: imageUrl,
        Age: age,
        Phone: phone,
        Birthday: birthday
      };

      const newStaffId = generateNextStaffId();
      const staffData = { ...updatedUserData };

      const staffRef = ref(db, `staffs/${newStaffId}`);
      await set(staffRef, staffData);

      await set(ref(db, 'staffCount'), staffCount + 1);
      
      e.target.reset();

      setUserData({
        Name: '',
        Email: '',
        Age: '',
        Phone: '',
        Birthday: {
          Date: '',
          Month: '',
          Year: ''
        },
        ImageUrl: '',
        Password: '',
        Role: ''
      });

      sendWelcomeEmail(newStaffId, userData.Email);
      setShowConfirmation(true);
    } catch (error) {
      console.error('Error adding staff:', error);
    }
  };

  const generateNextStaffId = () => {
    const nextIdNumber = staffCount + 1;
    return `staff_${nextIdNumber}`;
  };    

  const sendWelcomeEmail = (newStaffId, email) => {
    const templateParams = {
      to_name: `${userData.Name}`,
      to_email: email,
      from_name: "Winzen's Cafe",
      message: `Welcome to our team!\n\n` +
        `Staff ID: ${newStaffId}\n` +
        `Email: ${userData.Email}\n` +
        `Age: ${userData.Age}\n` +
        `Password: ${userData.Password}\n\n` +
        `Please keep this information secure.\n`,
    };

    emailjs.send('service_69dqxw6', 'template_jh9ugah', templateParams, 'sRGsYaOacJoBxQTPb')
      .then((result) => {
        console.log('Email sent successfully:', result.text);
      })
      .catch((error) => {
        console.error('Error sending email:', error.text);
      });
  };  

  const handleConfirmation = () => {
    setShowConfirmation(false);
  };

  const showAlertMessage = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
  };

  const hideAlertMessage = () => {
    setShowAlert(false);
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
            background: linear-gradient(180deg, rgba(165, 164, 168, 1) 0%, rgba(190, 190, 195, 1) 35%, rgba(255, 255, 255, 1) 100%);
            border-radius: 0px;
          }

          ::-webkit-scrollbar-thumb:hover {
            background: #555;
          }
        `}
      </style>
      <div className="p-4">
        <h1 className="text-6xl text-center mt-2 font-bold">Add Staffs</h1>
        <h3 className="text-lg md:text-base text-center text-gray-200 mt-4 md:mt-8 font-semibold bg-teal-800">ADD STAFF INFO TO ACCESS APP</h3>
        <div className="flex justify-center items-center h-screen mt-10 mb-10">
          <div className="max-w-md mx-auto bg-white border mt-24 border-gray-300 p-8 rounded-lg shadow-lg">
            <form ref={form} onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Name</label>
                <input type="text" name="Name" value={userData.Name} onChange={handleInputChange} className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 mb-4" />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                <input type="text" name="Email" value={userData.Email} onChange={handleInputChange} className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 mb-4" />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Age</label>
                <input type="number" name="Age" value={userData.Age} onChange={handleInputChange} className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 mb-4" />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Phone</label>
                <input type="number" name="Phone" value={userData.Phone} onChange={handleInputChange} className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 mb-4" />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Birthday</label>
                <div className="grid grid-cols-3 gap-2">
                  <input type="number" name="Birthday.Month" placeholder="Month" value={userData.Birthday.Month} onChange={handleInputChange} className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 mb-4" />
                  <input type="number" name="Birthday.Date" placeholder="Date" value={userData.Birthday.Date} onChange={handleInputChange} className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 mb-4" />
                  <input type="number" name="Birthday.Year" placeholder="Year" value={userData.Birthday.Year} onChange={handleInputChange} className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 mb-4" />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Image</label>
                <input type="file" accept="image/*" name="image" className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 mb-4" />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                <input type="password" name="Password" value={userData.Password} onChange={handleInputChange} className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 mb-4" />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Role</label>
                <select
                  name="Role"
                  value={userData.Role}
                  onChange={handleInputChange}
                  className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 mb-4"
                >
                  <option value="">Select Role</option>
                  {roleOptions.map((role, index) => (
                    <option key={index} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Add User</button>
            </form>
            {showAlert && (
              <div className="fixed z-10 inset-0 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen">
                  <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
                  <div className="relative bg-white rounded-lg overflow-hidden max-w-md w-full">
                    <div className="p-6">
                      <h2 className="text-xl font-semibold mb-4">Alert</h2>
                      <p className="text-gray-700">{alertMessage}</p>
                      <div className="mt-4 flex justify-end">
                        <button onClick={hideAlertMessage} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">OK</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {showConfirmation && (
              <div className="fixed z-10 inset-0 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen">
                  <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
                  <div className="relative bg-white rounded-lg overflow-hidden max-w-md w-full">
                    <div className="p-6">
                      <h2 className="text-xl font-semibold mb-4">Staff Added Successfully</h2>
                      <p className="text-gray-700">The Staff has been successfully added to the database.</p>
                      <div className="mt-4 flex justify-end">
                        <button onClick={handleConfirmation} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">OK</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Adduser;