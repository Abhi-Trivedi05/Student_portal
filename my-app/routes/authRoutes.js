import express from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import Student from '../models/Student.js';
import Faculty from '../models/Faculty.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Updated Login Route
router.post('/login', async (req, res) => {
    const { id, password, role } = req.body;
    
    if (!id || !password || !role) {
        return res.status(400).json({ success: false, message: "ID, password, and role are required" });
    }
    
    let userType, userIdColumn, user;
    
    try {
        if (role === 'admin') {
            user = await Admin.findOne({ username: id });
            userType = 'admin';
            userIdColumn = 'username';
        } else if (role === 'student') {
            user = await Student.findOne({ student_id: id });
            userType = 'student';
            userIdColumn = 'student_id';
        } else if (role === 'faculty') {
            user = await Faculty.findOne({ id: id });
            userType = 'faculty';
            userIdColumn = 'id';
        } else {
            return res.status(400).json({ success: false, message: "Invalid role" });
        }
        
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }
        
        // Use bcrypt to compare password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }
        
        // Generate JWT Token with role information
        const token = jwt.sign(
            { 
                id: user[userIdColumn], 
                role: userType,
                name: user.name || user.username || null,
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
                name: user.name || user.username || null,
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