import mysql from 'mysql2';

// Create a connection pool
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Wisteria@123',
    database: 'student_registration',
    port:'3306',  
});

// Expose the promise-based API
const promisePool = db.promise();  // Get promise API
export default promisePool;        // Export it to be used in your routes
