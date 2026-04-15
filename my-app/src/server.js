import express from 'express';
import mongoose from 'mongoose';
import connectDB from '../database/db.js';  // MongoDB database connection file
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import authRoutes from '../routes/authRoutes.js';  // Import auth routes (login)
import adminRoutes from '../routes/adminRoutes.js';
import announmentroutes from '../routes/announcementRoutes.js';
import feeRoutes from '../routes/feeapprovalRoutes.js';
import facultyRoutes from '../routes/facultyRoutes.js'; 
import studentRoutes from '../routes/studentRoutes.js';
import academicroutes from '../routes/academicroutes.js'; 

// import finalizeRegistration from '../routes/finalizeregistration.js';  // Import student routes
dotenv.config();  // Initialize dotenv to read .env files
connectDB(); // Connect to MongoDB
const app = express();

app.use(helmet({
    contentSecurityPolicy: {
        useDefaults: true,
        directives: {
            "script-src": ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
            "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            "font-src": ["'self'", "https://fonts.gstatic.com"],
            "connect-src": ["'self'", process.env.API_URL || "http://localhost:5000", "https://*.mongodb.net", process.env.FRONTEND_URL || "*"]
        }
    }
}));
app.use(compression());
app.use(cors({
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));
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
        // Mongoose connection state (1 = connected)
        if (mongoose.connection.readyState === 1) {
            res.json({ message: "Database connection successful" });
        } else {
            throw new Error("Not connected");
        }
    } catch (error) {
        console.error("Database Connection Error:", error);
        res.status(500).json({ message: "Database connection failed" });
    }
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
    // Set static folder
    app.use(express.static(path.join(__dirname, '../build')));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../', 'build', 'index.html'));
    });
} else {
    // Handle 404 (Route not found)
    app.use((req, res) => {
        res.status(404).json({ message: "Route not found" });
    });
}

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