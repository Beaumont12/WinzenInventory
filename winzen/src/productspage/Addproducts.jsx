import React, { useState, useCallback, useEffect } from 'react';
import 'react-image-crop/dist/ReactCrop.css';
import { getDatabase, ref, set, get } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { initializeApp } from 'firebase/app';
import Cropper from 'react-easy-crop';

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
const db = getDatabase();
const storage = getStorage();

const AddProducts = () => {
  const [src, setSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [categories, setCategories] = useState([]); // State to store categories
  const [selectedCategory, setSelectedCategory] = useState(''); // State to store selected category
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState(''); // State to store product description
  const [variations, setVariations] = useState([]);
  const [stockStatus, setStockStatus] = useState('In Stock'); // Default value
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [productCount, setProductCount] = useState(0); // State to store product count

  // Fetch categories from database on component mount
  useEffect(() => {
    const categoriesRef = ref(db, 'categories');
    get(categoriesRef).then((snapshot) => {
      if (snapshot.exists()) {
        const categoriesData = snapshot.val();
        setCategories(Object.values(categoriesData).map(category => category.Name)); // Extract category names
        setSelectedCategory(categoriesData.category_1.Name); // Set the default selected category
      }
    }).catch((error) => {
      console.error('Error fetching categories:', error);
    });

    // Fetch product count from the database
    const productCountRef = ref(db, 'productCount');
    get(productCountRef).then((snapshot) => {
      if (snapshot.exists()) {
        setProductCount(snapshot.val());
      }
    }).catch((error) => {
      console.error('Error fetching product count:', error);
    });
  }, []);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener("load", () => setSrc(reader.result));
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleCrop = useCallback(async () => {
    try {
      // Check if productId is empty
      if (!selectedCategory.trim() || !productName.trim() || variations.length === 0) {
        showAlertMessage('Please fill in all fields and add at least one variation.');
        return;
      }

      // Construct the product object with variations
      const product = {
        Category: selectedCategory, // Use the selected category
        Name: productName,
        Description: description, // Include description
        Variations: {
          temperature: {} // Initialize temperature object
        },
        imageURL: '', // Include imageURL
        stockStatus: stockStatus // Include stock status
      };

      // Populate product variations
      variations.forEach(({ temperature, sizes }) => {
        product.Variations.temperature[temperature] = {}; // Initialize temperature variation object
        sizes.forEach(({ size, price }) => {
          product.Variations.temperature[temperature][size] = price;
        });
      });

      // Increment product count and set the new product ID
      const newProductCount = productCount + 1;
      const productId = `Product${newProductCount}`;
      setProductCount(newProductCount);

      // Crop and upload the image
      const croppedImageBlob = await getCroppedImageBlob();
      const photoRef = storageRef(storage, `OM/${productId}.jpg`);
      await uploadBytes(photoRef, croppedImageBlob);
      const photoUrl = await getDownloadURL(photoRef);
      product.imageURL = photoUrl;

      // Add the product to the database under the specified product ID
      await Promise.all([
        set(ref(db, `products/${productId}`), product),
        set(ref(db, 'productCount'), newProductCount)
      ]);
      console.log('Product added successfully');

      // Reset state after adding product
      setSrc(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
      setSelectedCategory(categories[0]); // Reset selected category to the first category
      setProductName('');
      setDescription('');
      setVariations([]);

      // Confirmation message
      showConfirmationMessage('Product added successfully!');
    } catch (error) {
      console.error('Error cropping image or adding product:', error);
      showAlertMessage('Error cropping image or adding product.');
    }
  }, [croppedAreaPixels, selectedCategory, productName, description, variations, stockStatus, categories, productCount]);

  const getCroppedImageBlob = async () => {
    if (!croppedAreaPixels) return;
    const image = new Image();
    image.src = src;
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = croppedAreaPixels.width * scaleX;
    canvas.height = croppedAreaPixels.height * scaleY;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      image,
      croppedAreaPixels.x * scaleX,
      croppedAreaPixels.y * scaleY,
      croppedAreaPixels.width * scaleX,
      croppedAreaPixels.height * scaleY,
      0,
      0,
      croppedAreaPixels.width * scaleX,
      croppedAreaPixels.height * scaleY
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg');
    });
  };

  const handleAddVariation = () => {
    if (variations.length < 2) {
      setVariations([...variations, { temperature: '', sizes: [{ size: '', price: '' }] }]);
    } else {
      showConfirmationMessage("Maximum 2 variations allowed");
    }
  };

  // Function to handle variation change
  const handleVariationChange = (index, key, value) => {
    const newVariations = [...variations];
    newVariations[index][key] = value;

    // If the key is "temperature" and the value is "hot" or "iced",
    // ensure that both "hot" and "iced" variations are present in the state
    if (key === "temperature" && ["hot", "iced"].includes(value.toLowerCase())) {
      const oppositeTemp = value.toLowerCase() === "hot" ? "iced" : "hot";
      if (!newVariations[index].hasOwnProperty(oppositeTemp)) {
        newVariations[index][oppositeTemp] = {};
      }
    }

    setVariations(newVariations);
  };

  const handleAddSizePrice = (index) => {
    const newVariations = [...variations];
    newVariations[index].sizes.push({ size: '', price: '' });
    setVariations(newVariations);
  };

  const handleSizePriceChange = (variationIndex, sizeIndex, key, value) => {
    const newVariations = [...variations];
    newVariations[variationIndex].sizes[sizeIndex][key] = value;
    setVariations(newVariations);
  };

  const showAlertMessage = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
  };

  // Function to hide alert message
  const hideAlertMessage = () => {
    setShowAlert(false);
  };

  // Function to show confirmation message
  const showConfirmationMessage = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
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
      {showAlert && (
        <div className="fixed top-0 right-0 w-full h-full bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-4 rounded-md">
            <p className="text-xl font-semibold mb-4">{alertMessage}</p>
            <button className="text-white bg-emerald-400 py-1 px-4 rounded-md" onClick={hideAlertMessage}>OK</button>
          </div>
        </div>
      )}
      <div className="p-4">
        <h1 className="text-6xl font-bold text-center text-black mb-4 mt-2">Add Products</h1>
        <h3 className="text-lg md:text-base bg-teal-800 text-center text-gray-200 mt-4 md:mt-8 font-semibold">MAKE SURE PRODUCT ID IS UNIQUE</h3>
        <hr className="my-4 border-gray-500 border-2" />
        <div className="flex justify-center items-center mt-2 rounded-lg">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              setSrc(null);
              setSelectedCategory(categories[0]); // Reset selected category to the first category
              setProductName('');
              setDescription('');
              setVariations([]);
              onSelectFile(e);
            }}
            className="py-2 px-4 bg-yellow-600 rounded-lg text-white text-center items-center"
          />
        </div>
        <hr className="my-4 border-gray-500 border-2" />
        <div className="flex justify-center">
          <div className='flex justify-center items-center h-auto rounded-lg border-gray-200'>
            <div style={{ position: 'relative', width: '400px', height: '200px' }}>
              {src && (
                <Cropper
                  image={src}
                  crop={crop}
                  zoom={zoom}
                  aspect={325 / 150}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              )}
            </div>
          </div>
        </div>
        <hr className="my-4 border-gray-500 border-2" />
        <div className="flex justify-center">
          <div className="flex flex-col items-center mt-2 bg-gray-200 border border-gray-300 shadow-lg p-3 rounded-lg">
            
            <div className="flex flex-col">
              <label className={`input-label ${productName ? 'active' : ''} font-semibold ml-1`}>Product Name</label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="border border-gray-300 py-2 px-4 rounded-lg mb-2 shadow-gray-400 shadow-lg"
              />
            </div>
            <div className="flex flex-col">
              <label className={`input-label ${description ? 'active' : ''} font-semibold ml-1`}>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="border border-gray-300 py-2 px-4 rounded-lg mb-2 shadow-gray-400 shadow-lg"
                rows={4}
              />
            </div>
            <div className="flex flex-col">
              <label className={`input-label font-semibold ml-1`}>Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 py-2 px-4 rounded-lg mb-2 shadow-lg shadow-gray-400"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className={`input-label ${stockStatus ? 'active' : ''} font-semibold ml-1`}>Stock Status</label>
              <select
                value={stockStatus}
                onChange={(e) => setStockStatus(e.target.value)}
                className="border border-gray-300 py-2 px-4 rounded-lg mb-2 shadow-lg shadow-gray-400"
              >
                <option value="In Stock">In Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>
            <div className="flex justify-center mt-10">
              {variations.map((variation, index) => (
                <div key={index} className="mb-4">
                  {/* Temperature input */}
                  <div className="flex flex-col">
                    <label className={`input-label ${variation.temperature ? 'active' : ''} font-semibold ml-5`}>Temperature (hot/iced)</label>
                    <input
                      type="text"
                      value={variation.temperature}
                      onChange={(e) => handleVariationChange(index, 'temperature', e.target.value)}
                      className="m-4 border border-gray-300 shadow-gray-400 py-2 px-4 rounded-lg mb-2 shadow-lg"
                    />
                  </div>
                  {/* Size and price inputs */}
                  {variation.sizes.map((sizePrice, sizeIndex) => (
                    <div key={sizeIndex} className="flex mb-2 m-4">
                      {/* Size input */}
                      <div className="flex flex-col">
                        <label className={`input-label ${sizePrice.size ? 'active' : ''} font-semibold ml-1`}>Size</label>
                        <input
                          type="text"
                          value={sizePrice.size}
                          onChange={(e) => handleSizePriceChange(index, sizeIndex, 'size', e.target.value)}
                          className="border border-gray-300 shadow-gray-400 py-2 px-4 rounded-lg mr-2 shadow-lg"
                        />
                      </div>
                      {/* Price input */}
                      <div className="flex flex-col">
                        <label className={`input-label ${sizePrice.price ? 'active' : ''} font-semibold ml-1`}>Price</label>
                        <input
                          type="number"
                          value={sizePrice.price}
                          onChange={(e) => handleSizePriceChange(index, sizeIndex, 'price', parseInt(e.target.value))}
                          className="border border-gray-300 shadow-gray-400 py-2 px-4 rounded-lg shadow-lg"
                        />
                      </div>
                    </div>
                  ))}
                  {/* Add Size & Price button */}
                  <div className="flex justify-center">
                    <button onClick={() => handleAddSizePrice(index)} className="text-white shadow-lg shadow-gray-400 bg-yellow-600 px-3 py-2 rounded-lg mt-6">Add Size & Price</button>
                  </div>
                </div>
              ))}
            </div>
            {/* Add Variation button */}
            <button onClick={handleAddVariation} className="text-white bg-blue-600 px-3 py-2 shadow-gray-400 shadow-lg rounded-lg">Add Variation</button>
            {/* Add Product button */}
            <div className="flex justify-center mt-4">
              <button onClick={handleCrop} className="bg-emerald-800 text-white py-2 px-4 shadow-gray-400 rounded-lg shadow-lg">Add Product</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProducts;