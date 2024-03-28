import React, { useState, useEffect } from 'react';
import { getDatabase, ref, update, get, remove } from 'firebase/database';
import { initializeApp } from 'firebase/app';
import { PencilIcon, TrashIcon } from '@heroicons/react/solid';

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

const Managecategory = () => {
  const [categories, setCategories] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editedCategory, setEditedCategory] = useState({ id: '', name: '', newId: '' });
  const [deletedCategoryId, setDeletedCategoryId] = useState(null);
  const [confirmChanges, setConfirmChanges] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      const db = getDatabase();
      const categoriesRef = ref(db, 'categories');
      try {
        const snapshot = await get(categoriesRef);
        if (snapshot.exists()) {
          const categoriesData = snapshot.val();
          const categoriesList = Object.keys(categoriesData).map(categoryId => ({
            id: categoryId,
            name: categoriesData[categoryId].Name,
            productCount: 0
          }));
          setCategories(categoriesList);
          countProducts(categoriesList);
        } else {
          console.log("No categories available");
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const countProducts = async (categoriesList) => {
    const db = getDatabase();
    const productsRef = ref(db, 'products');
    try {
      const snapshot = await get(productsRef);
      if (snapshot.exists()) {
        const productsData = snapshot.val();
        categoriesList.forEach(category => {
          Object.values(productsData).forEach(product => {
            if (product.Category === category.name) {
              category.productCount++;
            }
          });
        });
        setCategories([...categoriesList]);
      }
    } catch (error) {
      console.error("Error counting products:", error);
    }
  };

  const deleteCategory = async (categoryId) => {
    setDeletedCategoryId(categoryId);
    setDeleteModalOpen(true);
  };  

  const confirmDeleteCategory = async () => {
    const db = getDatabase();
    const categoryRef = ref(db, `categories/${deletedCategoryId}`);

    try {
      await remove(categoryRef);
      setCategories(prevCategories => prevCategories.filter(category => category.id !== deletedCategoryId));
      console.log("Category deleted successfully");
      setConfirmDelete(true);
    } catch (error) {
      console.error("Error deleting category:", error);
    }
    setDeleteModalOpen(false);
  };

  const openEditModal = (category) => {
    setEditedCategory({
      id: category.id,
      newId: category.id,
      name: category.name
    });
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditedCategory({ id: '', name: '', newId: '' });
    setEditModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedCategory(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const confirmChangesAndSave = async () => {
    setEditModalOpen(false); // Close the edit modal
    
    // Show confirmation modal for saving changes
    setConfirmChanges(true);
  };    

  const saveChanges = async () => {
    const db = getDatabase();
    const categoryRef = ref(db, `categories/${editedCategory.id}`);
    
    try {
      await update(categoryRef, {});
    
      const newCategoryRef = ref(db, `categories/${editedCategory.newId}`);
      await update(newCategoryRef, {
        Name: editedCategory.name
      });
    
      setCategories(prevCategories =>
        prevCategories.map(category =>
          category.id === editedCategory.id ? { ...category, id: editedCategory.newId, name: editedCategory.name } : category
        )
      );
    
      setConfirmChanges(false); // Close the confirmation modal
      console.log("Changes saved successfully");
    } catch (error) {
      console.error("Error saving changes:", error);
    }
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
        <h1 className="text-6xl text-center text-black font-bold mt-2">Manage Category</h1>
        <h3 className="text-lg md:text-base text-center text-gray-200 mt-4 md:mt-8 font-semibold bg-teal-800">EDIT ONLY WHEN NECESSARY</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-8">
          {categories.map(category => (
            <div key={category.id} className="bg-gray-100 border border-gray-300 rounded-xl p-4 flex flex-col justify-center items-center text-center shadow-lg">
              <div className="text-teal-900 font-bold text-2xl mb-1 mt-2">{category.name}</div>
              <div className="text-white font-semibold text-xs bg-yellow-500 rounded-xl p-1">{category.id}</div>
              <div className="text-gray-700 font-bold text-xl mt-1">{category.productCount}</div>
              <div className="mt-4">
                <button className="text-white bg-emerald-400 py-1 px-2 rounded-lg mr-2" onClick={() => openEditModal(category)}>
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button className="text-white bg-red-700 py-1 px-2 rounded-lg" onClick={() => deleteCategory(category.id)}>
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
        {editModalOpen && (
          <div className="fixed top-0 left-0 w-full h-full bg-gray-600 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-4 rounded-md">
              <h2 className="text-xl font-semibold mb-4">Edit Category</h2>
              <div className="mb-4">
                <label className="block mb-2">Category ID:</label>
                <input type="text" name="newId" value={editedCategory.newId} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" disabled />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Category Name:</label>
                <input type="text" name="name" value={editedCategory.name} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <div className="flex justify-end">
                <button className="text-white bg-green-500 py-1 px-4 rounded-md mr-2" onClick={confirmChangesAndSave}>Save Changes</button>
                <button className="text-white bg-gray-500 py-1 px-4 rounded-md" onClick={closeEditModal}>Cancel</button>
              </div>
            </div>
          </div>
        )}
        {confirmChanges && (
          <div className="fixed top-0 left-0 w-full h-full bg-gray-600 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-4 rounded-md">
              <h2 className="text-xl font-semibold mb-4">Confirm Save Changes</h2>
              <p className="text-gray-700">Are you sure you want to save the changes?</p>
              <div className="flex justify-end mt-4">
                <button className="text-white bg-green-500 py-1 px-4 rounded-md mr-2" onClick={saveChanges}>Confirm</button>
                <button className="text-white bg-gray-500 py-1 px-4 rounded-md" onClick={() => setConfirmChanges(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
        {deleteModalOpen && (
          <div className="fixed top-0 left-0 w-full h-full bg-gray-600 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-4 rounded-md">
              <h2 className="text-xl font-semibold mb-4">Confirm Delete Category</h2>
              <p className="text-gray-700">Are you sure you want to delete this category?</p>
              <div className="flex justify-end mt-4">
                <button className="text-white bg-red-500 py-1 px-4 rounded-md mr-2" onClick={confirmDeleteCategory}>Confirm</button>
                <button className="text-white bg-gray-500 py-1 px-4 rounded-md" onClick={() => setDeleteModalOpen(false)}>Cancel</button>
              </div>
              {confirmDelete && <p className="text-green-600 mt-2">Category deleted successfully!</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Managecategory;