import React, { useState, useEffect } from "react";
import axios from "axios";
import ItemForm from './ItemForm'; 
import './HomeScreen.css'; 
import Modal from './AddItemPop'; 
import EditItem from './EditItem';

const HomeScreen = () => {
  const [items, setItems] = useState([]); 
  const [allItems, setAllItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [filterBy, setFilterBy] = useState(""); 
  const [showAddItemForm, setShowAddItemForm] = useState(false); 
  const [showEditItemForm, setShowEditItemForm] = useState(false); 
  const [selectedItem, setSelectedItem] = useState(null); 
  

  useEffect(() => {
    fetchItems(); 
  }, []);
  
  useEffect(() => {
    if (filterBy.trim() === "") {
      setItems(allItems); 
    } else {
      const filteredItems = allItems.filter(
        (item) =>
          (item.Username && item.Username.toLowerCase().includes(filterBy.toLowerCase())) ||
          (item.Item && item.Item.toLowerCase().includes(filterBy.toLowerCase())) ||
          (item.Category && item.Category.toLowerCase().includes(filterBy.toLowerCase()))
      );
      setItems(filteredItems);
    }
  }, [filterBy, allItems]); 

  // Fetch items from the server
  const fetchItems = async () => {
    try {
      const response = await axios.get("http://localhost:3001/items");
      setItems(response.data);
      setAllItems(response.data);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  // Handle sorting on the displayed items
  const handleSort = (criteria) => {
    setSortBy(criteria);
    const sortedItems = [...items].sort((a, b) => {
      if (criteria === "expiration_date") {
        const dateA = new Date(a.Expiration || a.expiration_date);
        const dateB = new Date(b.Expiration || b.expiration_date);
        return dateA - dateB;
      }
      if (criteria === "quantity") {
        // Parse quantity as a number, default to 0 if missing
        const quantityA = Number(a.Quantity || a.quantity) || 0;
        const quantityB = Number(b.Quantity || b.quantity) || 0;
        return quantityA - quantityB;
      }
  
      return 0;
    });
    setItems(sortedItems);
  };

  // Handle editing the quantity of an item
  const handleEditButtonClick = (item) => {
    console.log("Item selected for editing:", item);
    setSelectedItem(item); 
    setShowEditItemForm(true);
  };


  // Handle filtering by category or user
  const handleFilter = () => {
    if (filterBy.trim() === "") {
      // Reset to all items if no filter
      setItems(allItems);
      return;
    }
  
    const filteredItems = allItems.filter(
      (item) =>
        (item.Username && item.Username.toLowerCase().includes(filterBy.toLowerCase())) ||
        (item.Item && item.Item.toLowerCase().includes(filterBy.toLowerCase())) ||
        (item.Category && item.Category.toLowerCase().includes(filterBy.toLowerCase()))
    );
  
    setItems(filteredItems);
  };
  

  // Function to handle the close of the add item form
  const closeAddItemForm = () => {
    setShowAddItemForm(false);
  };

  // Function to refresh the items after adding a new one
  const handleAddItemSuccess = () => {
    fetchItems();
    closeAddItemForm(); 
  };



  return (
    <div className="inventory-container">
      <h1 className="inventory-header">Inventory</h1>
      <div className="search-filter">
        <input
          type="text"
          placeholder="Search items"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <input
          type="text"
          placeholder="Filter by user or category"
          value={filterBy}
          onChange={(e) => setFilterBy(e.target.value)}
          className="filter-input"
        />
      </div>
      <div className="sort-buttons">
        <button onClick={() => handleSort("expiration_date")} className="sort-button">
          Sort by Expiration Date
        </button>
        <button onClick={() => handleSort("quantity")} className="sort-button">
          Sort by Quantity
        </button>
      </div>
      <table className="inventory-table">
        <thead>
          <tr>
            <th>Added By</th>
            <th>Item</th>
            <th>Category</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Expiration</th>
            <th>Last Updated By</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items
            .filter((item) =>
              item.Item && item.Item.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((item) => (
              <tr key={`${item.Username}-${item.Item}`}> {}
                <td>{item.Username || "N/A"}</td>
                <td>{item.Item || "N/A"}</td>
                <td>{item.Category || "N/A"}</td>
                <td>{item.Price ? `$${item.Price.toFixed(2)}` : "N/A"}</td>
                <td>{item.Quantity || "N/A"}</td>
                <td>
                  {item.Expiration
                    ? new Date(item.Expiration).toISOString().split("T")[0]
                    : "N/A"}
                </td>
                <td>{item.LastUpdatedBy || "N/A"}</td>
                <td>
                  <button
                    className="edit-button"
                    onClick={() => handleEditButtonClick(item)}
                  >
                    Edit Quantity
                  </button>
                </td>
              </tr>
            ))}
        </tbody>


      </table>
      <div className="action-buttons">
        <button className="add-button" onClick={() => setShowAddItemForm(true)}>
          Add Item
        </button>
      </div>

      {}
      <Modal show={showAddItemForm} onClose={closeAddItemForm}>
        <ItemForm onClose={closeAddItemForm} onSuccess={handleAddItemSuccess} />
      </Modal>

      {}
      {showEditItemForm && (
        <Modal show={showEditItemForm} onClose={() => setShowEditItemForm(false)}>
          <EditItem
            item={selectedItem}
            onClose={() => setShowEditItemForm(false)}
            onSuccess={fetchItems}
          />
          {console.log("Selected Item passed to EditItem:", selectedItem)}
        </Modal>
      )}
    </div>
  );
};

export default HomeScreen;
