import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ItemForm.css'; 

const ItemForm = ({ onClose, onSuccess }) => {
    const [itemName, setItemName] = useState('');
    const [itemCat, setItemCat] = useState('');
    const [categories, setCategories] = useState([]); 
    const [quantity, setQuantity] = useState('');
    const [price, setPrice] = useState('');
    const [expirationDate, setExpirationDate] = useState('');
    const [error, setError] = useState(''); 

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('http://localhost:3001/categories');
                setCategories(response.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchCategories();
    }, []);
    
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Retrieve user_id from localStorage
        const user_id = localStorage.getItem('user_id');
        if (!user_id) {
            console.error('User ID is missing. Ensure the user is logged in.');
            setError('User ID is missing. Please log in to add an item.');
            return;
        }

        // Validate form inputs
        if (!itemName || !itemCat || !quantity || !price || !expirationDate) {
            setError('All fields are required.');
            return;
        }

        try {
            // Add the item to the inventory
            const response = await axios.post('http://localhost:3001/items', {
                item_name: itemName.toLowerCase(),
                item_cat: itemCat, 
                quantity: parseInt(quantity, 10),
                price: parseFloat(price),
                expiration_date: expirationDate,
                user_id: parseInt(user_id, 10), 
            });

            console.log('Item added successfully!', response.data);
            onSuccess();
            onClose();  
        } catch (error) {
            const errorMessage = error.response?.data || 'An error occurred while adding the item.';
            console.error('Error adding item:', errorMessage);
            setError(errorMessage); 
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Add New Item</h2>
                <form onSubmit={handleSubmit}>
                    {error && <p style={{ color: 'red' }}>{error}</p>} {}
                    <div className="form-group">
                        <label htmlFor="itemName">Item Name</label>
                        <input
                            type="text"
                            id="itemName"
                            value={itemName}
                            onChange={(e) => setItemName(e.target.value.toLowerCase())}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="itemCat">Category</label>
                        <select
                            id="itemCat"
                            className="form-control"
                            value={itemCat}
                            onChange={(e) => setItemCat(e.target.value)}
                            required
                        >
                            <option value="">Select a category</option>
                            {categories.map((category) => (
                                <option key={category.category_id} value={category.cat_name}>
                                    {category.cat_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="quantity">Quantity</label>
                        <input
                            type="number"
                            id="quantity"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="price">Price</label>
                        <input
                            type="number"
                            step="0.01"
                            id="price"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="expirationDate">Expiration Date</label>
                        <input
                            type="date"
                            id="expirationDate"
                            value={expirationDate}
                            onChange={(e) => setExpirationDate(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-actions">
                        <button type="submit">Add Item</button>
                        <button type="button" onClick={onClose}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ItemForm;
