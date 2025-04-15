import express from 'express';
import db from '../database/db.js';  // MySQL database connection file
import cors from 'cors';
import dotenv from 'dotenv';  // For managing environment variables

import authRoutes from '../routes/authRoutes.js';  // Import auth routes (login)
import adminRoutes from '../routes/adminRoutes.js';
import announmentroutes from '../routes/announcementRoutes.js';
import feeRoutes from '../routes/feeapprovalRoutes.js';
import facultyRoutes from '../routes/facultyRoutes.js'; 
import studentRoutes from '../routes/studentRoutes.js';
import academicroutes from '../routes/academicroutes.js'; 

// import finalizeRegistration from '../routes/finalizeregistration.js';  // Import student routes
dotenv.config();  // Initialize dotenv to read .env files

const app = express();

app.use(cors());
app.use(express.json());


// app.use('/api/fees', feeRoutes);
app.use('/api/auth', authRoutes);

// Keep admin dashboard under admin prefix
app.use('/api/admin', adminRoutes);
app.use('/api/announcements', announmentroutes);
app.use('/api/approval',feeRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/academic-calendar', academicroutes);
// app.use('/api/finalize-registration', finalizeRegistration);

// Test database connection
app.get("/api/test-db", async (req, res) => {
    try {
        await db.query("SELECT 1");
        res.json({ message: "Database connection successful" });
    } catch (error) {
        console.error("Database Connection Error:", error);
        res.status(500).json({ message: "Database connection failed" });
    }
});

// Handle 404 (Route not found)
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong!" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});