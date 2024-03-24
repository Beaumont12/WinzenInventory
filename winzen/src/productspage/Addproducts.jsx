import React, { useState, useCallback } from 'react';
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
  const [productId, setProductId] = useState('');
  const [category, setCategory] = useState('');
  const [productName, setProductName] = useState('');
  const [variations, setVariations] = useState([]);

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
      if (!productId.trim() || !category.trim() || !productName.trim() || variations.length === 0) {
        alert("Please fill in all fields and add at least one variation.");
        return;
      }
  
      // Check if the product ID already exists in the database
      const productIdRef = ref(db, `products/${productId}`);
      const snapshot = await get(productIdRef);
      if (snapshot.exists()) {
        alert("Product ID already exists. Please enter a unique product ID.");
        return;
      }
  
      // Check if an image is selected
      if (!src) {
        alert("Please select an image.");
        return;
      }
  
      // Crop and upload the image
      const croppedImageBlob = await getCroppedImageBlob();
      const photoRef = storageRef(storage, `OM/${productId}.jpg`);
      await uploadBytes(photoRef, croppedImageBlob);
      const photoUrl = await getDownloadURL(photoRef);
  
      // Construct the product object with variations
      const product = {
        Category: category,
        Name: productName,
        Variations: {
          temperature: {} // Initialize temperature object
        },
        imageURL: photoUrl // Include imageURL
      };
  
      // Populate product variations
      variations.forEach(({ temperature, sizes }) => {
        product.Variations.temperature[temperature] = {}; // Initialize temperature variation object
        sizes.forEach(({ size, price }) => {
          product.Variations.temperature[temperature][size] = price;
        });
      });
  
      // Add the product to the database under the specified product ID
      await set(ref(db, `products/${productId}`), product);
      console.log('Product added successfully');
  
      // Reset state after adding product
      setSrc(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
      setProductId('');
      setCategory('');
      setProductName('');
      setVariations([]);
      
      // Confirmation message
      alert('Product added successfully!');
    } catch (error) {
      console.error('Error cropping image or adding product:', error);
    }
  }, [croppedAreaPixels, productId, src, variations, category, productName]);  

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
      alert("Maximum 2 variations allowed");
    }
  };  

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
        <h1 className="text-6xl font-bold text-center text-black mb-4 mt-2">Add Products</h1>
        <h3 className="text-lg md:text-base bg-teal-800 text-center text-gray-200 mt-4 md:mt-8 font-semibold">MAKE SURE PRODUCT ID IS UNIQUE</h3>
        <hr className="my-4 border-gray-500 border-2" />
        <div className="flex justify-center items-center mt-2 rounded-lg">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              setSrc(null);
              setProductId('');
              setCategory('');
              setProductName('');
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
            <input
              type="text"
              placeholder="Product ID"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="border border-gray-300 py-2 px-4 rounded-lg mt-4 mb-2 shadow-lg shadow-gray-400"
            />
            <input
              type="text"
              placeholder="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border border-gray-300 py-2 px-4 rounded-lg mb-2 shadow-lg shadow-gray-400"
            />
            <input
              type="text"
              placeholder="Product Name"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="border border-gray-300 py-2 px-4 rounded-lg mb-14 shadow-gray-400 shadow-lg"
            />
            <div className="flex justify-center">
              {variations.map((variation, index) => (
                <div key={index} className="mb-4 ">
                  <input
                    type="text"
                    placeholder="Temperature (hot/iced)"
                    value={variation.temperature}
                    onChange={(e) => handleVariationChange(index, 'temperature', e.target.value)}
                    className="m-4 border border-gray-300 shadow-gray-400 py-2 px-4 rounded-lg mb-2 shadow-lg"
                  />
                  {variation.sizes.map((sizePrice, sizeIndex) => (
                    <div key={sizeIndex} className="flex mb-2 m-4">
                      <input
                        type="text"
                        placeholder="Size"
                        value={sizePrice.size}
                        onChange={(e) => handleSizePriceChange(index, sizeIndex, 'size', e.target.value)}
                        className="border border-gray-300 shadow-gray-400 py-2 px-4 rounded-lg mr-2 shadow-lg"
                      />
                      <input
                        type="number"
                        placeholder="Price"
                        value={sizePrice.price}
                        onChange={(e) => handleSizePriceChange(index, sizeIndex, 'price', parseInt(e.target.value))}
                        className="border border-gray-300 shadow-gray-400 py-2 px-4 rounded-lg shadow-lg"
                      />
                    </div>
                  ))}
                  <div className="flex justify-center">
                    <button onClick={() => handleAddSizePrice(index)} className="text-white shadow-lg shadow-gray-400 bg-yellow-600 px-3 py-2 rounded-lg mt-6">Add Size & Price</button>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={handleAddVariation} className="text-white bg-blue-600 px-3 py-2 shadow-gray-400 shadow-lg rounded-lg">Add Variation</button>
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