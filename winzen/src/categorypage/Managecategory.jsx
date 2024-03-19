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
  const [editedCategory, setEditedCategory] = useState({ id: '', name: '', newId: '' });
  const [confirmChanges, setConfirmChanges] = useState(false);

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
            name: categoriesData[categoryId].Name
          }));
          setCategories(categoriesList);
        } else {
          console.log("No categories available");
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const deleteCategory = async (categoryId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this category?");
    if (!confirmDelete) return;
  
    const db = getDatabase();
    const categoryRef = ref(db, `categories/${categoryId}`);
  
    try {
      await remove(categoryRef); // Use remove function to delete the entire category node
      setCategories(prevCategories => prevCategories.filter(category => category.id !== categoryId));
      console.log("Category deleted successfully");
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };  

  const openEditModal = (category) => {
    setEditedCategory({
      id: category.id,
      newId: category.id, // Set both id and newId to the existing ID initially
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
    const confirmSave = window.confirm("Are you sure you want to save the changes?");
    if (!confirmSave) return;
    
    const db = getDatabase();
    const categoryRef = ref(db, `categories/${editedCategory.id}`);
    
    try {
      // First, delete the old category
      await update(categoryRef, {});
    
      // Then, add the new category with the updated ID and name
      const newCategoryRef = ref(db, `categories/${editedCategory.newId}`);
      await update(newCategoryRef, {
        Name: editedCategory.name
      });
    
      // Update the categories state with the edited category
      setCategories(prevCategories =>
        prevCategories.map(category =>
          category.id === editedCategory.id ? { ...category, id: editedCategory.newId, name: editedCategory.name } : category
        )
      );
    
      setConfirmChanges(true);
      console.log("Changes saved successfully");
      closeEditModal();
    } catch (error) {
      console.error("Error saving changes:", error);
    }
  };    

  return (
    <div className="flex-1 bg-gray-200 bg-cover bg-center bg-no-repeat">
      <div className="p-4 my-2">
        <h1 className="text-6xl text-center font-bold">Manage Category!</h1>
        <h3 className="text-2xl text-center mt-4 md:mt-8 font-semibold">Enjoy browsing!</h3>
        <table className="mx-auto mt-8 border-collapse border border-gray-800 w-full text-center">
          <thead>
            <tr className="bg-gray-300">
              <th className="px-4 py-2">Category ID</th>
              <th className="px-4 py-2">Category Name</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(category => (
              <tr key={category.id} className="bg-gray-200">
                <td className="border border-gray-800 px-4 py-2">{category.id}</td>
                <td className="border border-gray-800 px-4 py-2">{category.name}</td>
                <td className="border border-gray-800 px-4 py-2">
                <button className="text-white bg-yellow-600 py-1 px-2 rounded-md mr-2" onClick={() => openEditModal(category)}>
                  <PencilIcon className="h-5 w-5" />
                </button>

                <button className="text-white bg-red-700 py-1 px-2 rounded-md" onClick={() => deleteCategory(category.id)}>
                  <TrashIcon className="h-5 w-5" />
                </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {editModalOpen && (
          <div className="fixed top-0 left-0 w-full h-full bg-gray-600 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-4 rounded-md">
              <h2 className="text-xl font-semibold mb-4">Edit Category</h2>
              <div className="mb-4">
                <label className="block mb-2">Category ID:</label>
                <input type="text" name="newId" value={editedCategory.newId} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Category Name:</label>
                <input type="text" name="name" value={editedCategory.name} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <div className="flex justify-end">
                <button className="text-white bg-green-500 py-1 px-4 rounded-md mr-2" onClick={confirmChangesAndSave}>Save Changes</button>
                <button className="text-white bg-gray-500 py-1 px-4 rounded-md" onClick={closeEditModal}>Cancel</button>
              </div>
              {confirmChanges && <p className="text-green-600 mt-2">Changes saved successfully!</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Managecategory;