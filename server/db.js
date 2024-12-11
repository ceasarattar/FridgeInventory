const mysql = require('mysql');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',         
    password: '', //password for your MySQL server
    database: 'fridge_db' 
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL!');

});

module.exports = db;