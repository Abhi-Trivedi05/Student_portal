import express from 'express';
import db from '../database/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = 'your_jwt_secret_key';

// Unified Login Route
router.post('/login', async (req, res) => {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
        return res.status(400).json({ message: "Username, password, and role are required" });
    }

    let query, userType, userIdColumn;

    // Determine table and ID column based on role
    if (role === 'admin') {
        query = 'SELECT * FROM admin WHERE username = ?';
        userType = 'admin';
        userIdColumn = 'id';
    } else if (role === 'student') {
        query = 'SELECT * FROM students WHERE student_id = ?';
        userType = 'student';
        userIdColumn = 'student_id';
    } else if (role === 'faculty') {
        query = 'SELECT * FROM faculty WHERE id = ?'; // Adjusted to match schema
        userType = 'faculty';
        userIdColumn = 'id';
    } else {
        return res.status(400).json({ message: "Invalid role" });
    }

    try {
        const [rows] = await db.promise().query(query, [username]);

        if (rows.length === 0) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const user = rows[0];

        // Compare the hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate JWT Token with user ID and role
        const token = jwt.sign(
            { id: user[userIdColumn], role: userType },  // Use the dynamic ID column
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ message: 'Login successful', token, role: userType });
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
