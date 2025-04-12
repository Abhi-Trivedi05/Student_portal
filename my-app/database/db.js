import mysql from 'mysql2';

// Create a connection pool
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'student_registration',
    port:'3306',  
});

// Expose the promise-based API
const promisePool = db.promise();  // Get promise API
export default promisePool;        // Export it to be used in your routes
