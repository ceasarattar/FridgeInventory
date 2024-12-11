const express = require('express');
const db = require('./db');

const app = express();
app.use(express.json());

const cors = require('cors');
app.use(cors({
    origin: 'http://localhost:3000'
}));

const PORT = 3001;
app.listen(PORT, () => {
    console.log('Server running on http://localhost:${PORT}');
});


 // Get all fridge items
app.get('/items', (req, res) => {
    const { filter } = req.query;
    let sql = `
        SELECT 
            FridgeItem.item_id, 
            User.user_name AS Username, 
            FridgeItem.item_name AS Item, 
            Category.cat_name AS Category, 
            FridgeItem.price as Price, 
            FridgeItem.quantity as Quantity, 
            FridgeItem.expiration_date AS Expiration,
            LastUpdatedUser.user_name AS LastUpdatedBy
        FROM 
            FridgeItem
        LEFT JOIN user_fridge ON FridgeItem.item_id = user_fridge.item_id
        LEFT JOIN User ON user_fridge.user_id = User.user_id
        LEFT JOIN Category ON FridgeItem.item_cat = Category.category_id
        LEFT JOIN User AS LastUpdatedUser ON FridgeItem.last_updated_by = LastUpdatedUser.user_id;
    `;

    // Apply filtering if "filter" parameter exists
    if (filter) {
        sql += `
            WHERE 
                User.user_name LIKE ? OR 
                Category.cat_name LIKE ?
        `;
    }

    db.query(sql, filter ? [`%${filter}%`, `%${filter}%`, `%${filter}%`] : [], (err, results) => {
        if (err) {
            console.error("Database query failed:", err);
            res.status(500).send('Database query failed');
            return;
        }
        console.log("Query Results:", results); // Log the query results
        res.json(results);
    });
});


// Add a new fridge item

app.post('/items', (req, res) => {
    const { user_id, item_name, item_cat, quantity, price, expiration_date } = req.body;

    if (!user_id) {
        return res.status(401).send('Unauthorized: No user ID provided');
    }

    // Check if the item already exists in the inventory
    const sqlCheckDuplicate = `
    SELECT FridgeItem.item_id 
    FROM FridgeItem 
    WHERE LOWER(FridgeItem.item_name) = LOWER(?)
    `;

    db.query(sqlCheckDuplicate, [item_name.toLowerCase()], (err, results) => {
        if (err) {
            console.error('Error checking for duplicate item:', err);
            return res.status(500).send('Failed to check for duplicate item');
        }
    
        if (results.length > 0) {
            return res.status(400).send('Item already exists in the inventory.');
        }

        // Query to get the category_id from the category name
        const sqlGetCategoryId = 'SELECT category_id FROM Category WHERE cat_name = ?';

        db.query(sqlGetCategoryId, [item_cat], (err, results) => {
            if (err) {
                console.error('Error fetching category ID:', err);
                return res.status(500).send('Failed to fetch category ID');
            }

            if (results.length === 0) {
                return res.status(400).send(`Category "${item_cat}" does not exist`);
            }

            const category_id = results[0].category_id;

            // Insert the item into the FridgeItem table
            const sqlInsertItem = `
                INSERT INTO FridgeItem (item_name, quantity, price, expiration_date, item_cat) 
                VALUES (?, ?, ?, ?, ?)
            `;
            db.query(sqlInsertItem, [item_name.toLowerCase(), quantity, price, expiration_date, category_id], (err, result) => {
                if (err) {
                    console.error('Error inserting item:', err);
                    return res.status(500).send('Failed to add item');
                }

                const item_id = result.insertId;

                // Link the user to the item in the user_fridge table
                const sqlInsertUserFridge = `
                    INSERT INTO user_fridge (user_id, item_id) 
                    VALUES (?, ?)
                `;
                db.query(sqlInsertUserFridge, [user_id, item_id], (err) => {
                    if (err) {
                        console.error('Error linking user to item:', err);
                        return res.status(500).send('Failed to link user to item');
                    }

                    res.send('Item added successfully!');
                });
            });
        });
    });
});



// Update existing item
app.put('/items/:id', (req, res) => {
    const { id } = req.params;
    const { quantity, user_id } = req.body;

    if (!id) {
        return res.status(400).send('Item ID is required');
    }

    if (!user_id) {
        return res.status(401).send('Unauthorized: No user ID provided');
    }

    if (!quantity) {
        return res.status(400).send('Quantity required');
    }

    const sql = `
        UPDATE FridgeItem 
        SET quantity = ?, last_updated_by = ?
        WHERE item_id = ?
    `;

    db.query(sql, [quantity, user_id,id], (err, result) => {
        if (err) {
            console.error('Error updating item:', err);
            return res.status(500).send('Failed to update item');
        }

        if (result.affectedRows === 0) {
            return res.status(404).send('Item not found');
        }

        res.send('Item updated successfully!');
    });
});


// Delete item
app.delete('/items/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM FridgeItem WHERE item_id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Failed to delete item');
            return;
        }
        res.send('Item deleted successfully!');
    });
});


// Add user
app.post('/users', (req, res) => {
    const { user_id, user_name, passcode } = req.body; 

    if (!user_id || !user_name || !passcode) {
        return res.status(400).send('User name and passcode are required');
    }

    const sql = 'INSERT INTO User (user_id, user_name, passcode) VALUES (?, ?, ?)';
    db.query(sql, [ user_id, user_name, passcode], (err, result) => {
        if (err) {
            //check again, it is not working
            console.error('Error details:', err); 
            res.status(500).send('Failed to add user');
            return;
        }
        res.status(201).send('User added successfully!');
    });
});


// Link user to an item
app.post('/users/:user_id/items/:item_id', (req, res) => {
    const { user_id, item_id } = req.params;
    const sql = 'INSERT INTO UserFridge (user_id, item_id) VALUES (?, ?)';
    db.query(sql, [user_id, item_id], (err, result) => {
        if (err) {
            //test
            console.error(err);
            res.status(500).send('Failed to link user to item');
            return;
        }
        res.send('User linked to item successfully!');
    });
});

// Assign category to item
app.post('/items/:item_id/categories/:category_id', (req, res) => {
    const { item_id, category_id } = req.params;
    const sql = 'INSERT INTO ItemCategory (item_id, category_id) VALUES (?, ?)';
    db.query(sql, [item_id, category_id], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Failed to assign category');
            return;
        }
        res.send('Category assigned successfully!');
    });
});

// Get categorie for an item
app.get('/items/:item_id/categories', (req, res) => {
    const { item_id } = req.params;
    const sql = `
        SELECT Category.cat_name
        FROM Category
        JOIN FridgeItem ON FridgeItem.item_cat = Category.category_id
        WHERE FridgeItem.item_id = ?
    `;
    db.query(sql, [item_id], (err, results) => {
        if (err) {
            //test cat
            console.error(err);
            res.status(500).send('Failed to fetch categories');
            return;
        }
        res.json(results);
    });
});


app.post('/login', (req, res) => {
    const { user_name, passcode } = req.body;

    const sql = 'SELECT * FROM User WHERE user_name = ? AND passcode = ?';
    db.query(sql, [user_name, passcode], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Database query failed');
            return;
        }

        if (results.length === 0) {
            // user found with the provided credentials
            res.status(401).send('Invalid username or password');
        } else {
            //success
            res.json({
                message: 'Login successful',
                user_id: results[0].user_id // Return only the user_id
            });
        }
    });
});


// Route to get all categories
app.get('/categories', (req, res) => {
    db.query('SELECT * FROM Category', (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching categories' });
        }
        res.json(results);
    });
});

//new category
app.post('/categories', (req, res) => {
    const { cat_name } = req.body;

    // Check if category exists
    db.query('SELECT * FROM Category WHERE LOWER(cat_name) = LOWER(?)', [cat_name], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error checking category' });
        }

        if (results.length > 0) {
            return res.status(400).json({ message: 'Category already exists' });
        }

        // If category doesn't exist, create it
        db.query('INSERT INTO Category (cat_name) VALUES (?)', [cat_name], (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Error creating category' });
            }

            res.status(201).json({ category_id: results.insertId, cat_name });
        });
    });
});


app.delete('/items/:id', (req, res) => {
    const { id } = req.params;
  
    const sql = 'DELETE FROM FridgeItem WHERE item_id = ?';
    db.query(sql, [id], (err, result) => {
      if (err) {
        console.error('Error deleting item:', err);
        res.status(500).send('Failed to delete item');
        return;
      }
  
      if (result.affectedRows === 0) {
        res.status(404).send('Item not found');
        return;
      }
  
      res.send('Item deleted successfully!');
    });
  });
  