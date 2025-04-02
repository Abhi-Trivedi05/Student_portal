import express from 'express';
import db from '../database/db.js'; 
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Updated Login Route
router.post('/login', async (req, res) => {
    const { id, password, role } = req.body;
    
    if (!id || !password || !role) {
        return res.status(400).json({ success: false, message: "ID, password, and role are required" });
    }
    
    let query, userType, userIdColumn;
    
    if (role === 'admin') {
        query = 'SELECT * FROM admin WHERE username = ?';
        userType = 'admin';
        userIdColumn = 'id';
    } else if (role === 'student') {
        query = 'SELECT * FROM students WHERE student_id = ?';
        userType = 'student';
        userIdColumn = 'student_id';
    } else if (role === 'faculty') {
        query = 'SELECT * FROM faculty WHERE id = ?';
        userType = 'faculty';
        userIdColumn = 'id';
    } else {
        return res.status(400).json({ success: false, message: "Invalid role" });
    }
    
    try {
        const [rows] = await db.query(query, [id]);
        
        if (rows.length === 0) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }
        
        const user = rows[0];
        
        // Directly compare plain text passwords
        if (password !== user.password) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }
        
        // Generate JWT Token with role information
        const token = jwt.sign(
            { 
                id: user[userIdColumn], 
                role: userType,
                name: user.name || null,
                department: user.department || null
            },
            JWT_SECRET,
            { expiresIn: '1h' }
        );
        
        // Return user information along with token
        res.json({ 
            success: true, 
            message: 'Login successful', 
            token, 
            role: userType,
            user: {
                id: user[userIdColumn],
                name: user.name || null,
                department: user.department || null,
                status: user.status || 'active'
            }
        });
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

export default router;