import express from 'express';
import db from '../database/db.js';  // MySQL database connection file
import cors from 'cors';
import studentRoutes from '../routes/studentRoutes.js';  // Import student routes
import courseRoutes from '../routes/courseRoutes.js';  // Import course routes
import facultyRoutes from '../routes/facultyRoutes.js';  // Import faculty routes
import feeRoutes from '../routes/feeRoutes.js';  // Import fee routes
import authRoutes from '../routes/authRoutes.js';  // Import auth routes (login)

const app = express();

app.use(cors());
app.use(express.json());

// Use the routes for respective paths
app.use('/api/students', studentRoutes);  // Use student routes
app.use('/api/courses', courseRoutes);  // Use course routes
app.use('/api/faculty', facultyRoutes);  // Use faculty routes
app.use('/api/fees', feeRoutes);  // Use fee routes
app.use('/api/auth', authRoutes);  // Use auth routes (login)

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

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
