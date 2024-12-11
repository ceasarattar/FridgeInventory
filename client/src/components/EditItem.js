import React, { useState } from "react";
import axios from "axios";
import "./EditItem.css";

const EditItem = ({ item, onClose, onSuccess }) => {
  const [newQuantity, setNewQuantity] = useState(item.Quantity || ""); 
  const [error, setError] = useState(""); 

  const handleSave = async () => {
    const user_id = localStorage.getItem('user_id');
  
    //test the item
    console.log("EditItem received item:", item); 
    console.log("Retrieved user_id from localStorage:", user_id);
  
    if (!user_id) {
        //fixed
      console.error('User ID is missing. Ensure the user is logged in.');
      setError('User ID is missing. Please log in to add an item.');
      return;
    }
  
    if (newQuantity === "") {
      setError("Quantity cannot be empty.");
      return;
    }
  
    try {
      if (parseInt(newQuantity, 10) === 0) {
        // If the quantity is zero, delete the item
        // i fixed it shareek
        console.log("Deleting item:", item.item_id);
        await axios.delete(`http://localhost:3001/items/${item.item_id}`);
        console.log("Item deleted successfully");
      } else {
        // Otherwise, update the item
        console.log("Updating item with:", {
          quantity: parseInt(newQuantity, 10),
          user_id: parseInt(user_id, 10),
        }); 
  
        await axios.put(`http://localhost:3001/items/${item.item_id}`, {
          quantity: parseInt(newQuantity, 10),
          user_id: parseInt(user_id, 10),
        });
        console.log("Item updated successfully");
      }
  
      setError(""); 
      onSuccess(); 
      onClose(); 
    } catch (error) {
      const errorMessage = error.response?.data || "An error occurred while updating the quantity.";
      console.error("Error updating quantity:", errorMessage);
      setError(errorMessage); 
    }
  };
  

  return (
    <div className="edit-item-container">
      <h2>Edit Quantity</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div className="form-group">
        <label htmlFor="quantity">New Quantity</label>
        <input
          type="number"
          id="quantity"
          value={newQuantity}
          onChange={(e) => setNewQuantity(e.target.value)}
          required
        />
      </div>
      <div className="form-actions">
        <button onClick={handleSave}>Save</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default EditItem;
