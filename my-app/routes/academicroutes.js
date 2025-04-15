import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import db from '../database/db.js';

const router = express.Router();

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        const uploadDir = path.join(process.cwd(), 'uploads');
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
        // Create unique filename with original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'calendar-' + uniqueSuffix + ext);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        // Accept only PDF files
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'), false);
        }
    }
});

// Middleware to verify admin role
const verifyAdmin = (req, res, next) => {
    const role = req.header('Role'); 

    if (!role) {
        return res.status(401).json({ success: false, message: "Authorization denied: No role found." });
    }

    if (role !== 'admin') {
        return res.status(403).json({ success: false, message: "Access denied: Admin role required." });
    }

    next();
};

// Middleware to verify authenticated user (admin or student)
const verifyUser = (req, res, next) => {
    const role = req.header('Role');

    if (!role) {
        return res.status(401).json({ success: false, message: "Authorization denied: No role found." });
    }

    if (!['admin', 'student'].includes(role)) {
        return res.status(403).json({ success: false, message: "Access denied: Valid role required." });
    }

    next();
};

// Get academic years for dropdown (accessible to all authenticated users)
router.get('/academic-years', verifyUser, async (req, res) => {
    try {
        const [years] = await db.query('SELECT id, year_name FROM academic_years ORDER BY start_date DESC');
        
        if (!years || years.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'No academic years found.' 
            });
        }
        
        res.status(200).json({ 
            success: true, 
            academicYears: years 
        });
    } catch (error) {
        console.error("Error fetching academic years:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching academic years: " + error.message 
        });
    }
});

// Get all academic calendars (accessible to all authenticated users)
router.get('/calendars', verifyUser, async (req, res) => {
    try {
        const role = req.header('Role');
        let query;
        
        // Students can only see active calendars
        if (role === 'student') {
            query = `
                SELECT ac.id, ac.title, ac.file_name, ac.file_size, ac.upload_date, 
                       ac.status, ay.year_name as academic_year, a.username as uploaded_by
                FROM academic_calendars ac
                JOIN academic_years ay ON ac.academic_year_id = ay.id
                JOIN admin a ON ac.admin_id = a.id
                WHERE ac.status = 'active'
                ORDER BY ac.upload_date DESC
            `;
        } else {
            // Admins can see all calendars
            query = `
                SELECT ac.id, ac.title, ac.file_name, ac.file_size, ac.upload_date, 
                       ac.status, ay.year_name as academic_year, a.username as uploaded_by
                FROM academic_calendars ac
                JOIN academic_years ay ON ac.academic_year_id = ay.id
                JOIN admin a ON ac.admin_id = a.id
                ORDER BY ac.upload_date DESC
            `;
        }
        
        const [calendars] = await db.query(query);
        
        if (!calendars || calendars.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'No academic calendars found.' 
            });
        }
        
        // Format the dates and file sizes
        const formattedCalendars = calendars.map(calendar => {
            return {
                ...calendar,
                upload_date: new Date(calendar.upload_date).toLocaleString(),
                file_size: formatFileSize(calendar.file_size)
            };
        });
        
        res.status(200).json({ 
            success: true, 
            calendars: formattedCalendars 
        });
    } catch (error) {
        console.error("Error fetching academic calendars:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching academic calendars: " + error.message 
        });
    }
});

// Helper function to format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Upload new academic calendar (admin only)
router.post('/upload', verifyAdmin, upload.single('pdfFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                message: 'No file uploaded or invalid file format. Please upload a PDF file.' 
            });
        }

        const { title, academicYearId } = req.body;
        const adminId = req.body.adminId; // This should be extracted from auth token in a real app
        
        if (!title || !academicYearId || !adminId) {
            // Delete the uploaded file if validation fails
            fs.unlinkSync(req.file.path);
            
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide all required fields: title, academic year, and admin ID.' 
            });
        }

        // Log incoming data for debugging
        console.log("Upload request data:", {
            title,
            academicYearId,
            adminId,
            fileName: req.file.originalname,
            fileSize: req.file.size
        });

        // Read the file for database storage
        const filePath = req.file.path;
        const fileBuffer = fs.readFileSync(filePath);
        
        // Check if the academic year exists
        const [yearCheck] = await db.query('SELECT id FROM academic_years WHERE id = ?', [academicYearId]);
        if (!yearCheck || yearCheck.length === 0) {
            fs.unlinkSync(filePath);
            return res.status(400).json({
                success: false,
                message: 'Invalid academic year ID.'
            });
        }
        
        // Check if the admin exists
        const [adminCheck] = await db.query('SELECT id FROM admin WHERE id = ?', [adminId]);
        if (!adminCheck || adminCheck.length === 0) {
            fs.unlinkSync(filePath);
            return res.status(400).json({
                success: false,
                message: 'Invalid admin ID.'
            });
        }

        // Insert into academic_calendars table directly using prepared statement
        // This approach avoids potential issues with the LONGBLOB parameter
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            
            const query = `
                INSERT INTO academic_calendars 
                (title, academic_year_id, pdf_file, file_name, file_size, admin_id, status) 
                VALUES (?, ?, ?, ?, ?, ?, 'active')
            `;
            
            const [result] = await connection.query(query, [
                title,
                academicYearId,
                fileBuffer,
                req.file.originalname,
                req.file.size,
                adminId
            ]);
            
            await connection.commit();
            
            // Delete the file from disk as we've stored it in the database
            fs.unlinkSync(filePath);
            
            console.log("Calendar inserted with ID:", result.insertId);
            
            res.json({ 
                success: true, 
                message: "Academic calendar uploaded successfully!",
                fileName: req.file.originalname,
                fileSize: formatFileSize(req.file.size),
                calendarId: result.insertId
            });
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error("Error uploading academic calendar:", error);
        
        // Delete the uploaded file in case of error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        
        res.status(500).json({ 
            success: false, 
            message: "Error uploading academic calendar: " + error.message 
        });
    }
});

// Download calendar PDF (accessible to all authenticated users)
router.get('/download/:id', verifyUser, async (req, res) => {
    try {
        const { id } = req.params;
        const role = req.header('Role');
        
        let query;
        
        // Students can only download active calendars
        if (role === 'student') {
            query = 'SELECT pdf_file, file_name FROM academic_calendars WHERE id = ? AND status = "active"';
        } else {
            // Admins can download any calendar
            query = 'SELECT pdf_file, file_name FROM academic_calendars WHERE id = ?';
        }
        
        const [calendar] = await db.query(query, [id]);
        
        if (!calendar || calendar.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: role === 'student' ? 'Calendar not found or not active.' : 'Calendar not found.' 
            });
        }
        
        const fileData = calendar[0].pdf_file;
        const fileName = calendar[0].file_name;
        
        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        
        // Send the file
        res.send(fileData);
    } catch (error) {
        console.error("Error downloading calendar:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error downloading calendar: " + error.message 
        });
    }
});

// Get a specific calendar's details (accessible to all authenticated users)
router.get('/calendar/:id', verifyUser, async (req, res) => {
    try {
        const { id } = req.params;
        const role = req.header('Role');
        
        let query;
        
        // Students can only view active calendars
        if (role === 'student') {
            query = `
                SELECT ac.id, ac.title, ac.file_name, ac.file_size, ac.upload_date, 
                       ac.status, ay.year_name as academic_year, a.username as uploaded_by
                FROM academic_calendars ac
                JOIN academic_years ay ON ac.academic_year_id = ay.id
                JOIN admin a ON ac.admin_id = a.id
                WHERE ac.id = ? AND ac.status = 'active'
            `;
        } else {
            // Admins can view any calendar
            query = `
                SELECT ac.id, ac.title, ac.file_name, ac.file_size, ac.upload_date, 
                       ac.status, ay.year_name as academic_year, a.username as uploaded_by
                FROM academic_calendars ac
                JOIN academic_years ay ON ac.academic_year_id = ay.id
                JOIN admin a ON ac.admin_id = a.id
                WHERE ac.id = ?
            `;
        }
        
        const [calendar] = await db.query(query, [id]);
        
        if (!calendar || calendar.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: role === 'student' ? 'Calendar not found or not active.' : 'Calendar not found.' 
            });
        }
        
        // Format the date and file size
        const formattedCalendar = {
            ...calendar[0],
            upload_date: new Date(calendar[0].upload_date).toLocaleString(),
            file_size: formatFileSize(calendar[0].file_size)
        };
        
        res.status(200).json({ 
            success: true, 
            calendar: formattedCalendar 
        });
    } catch (error) {
        console.error("Error fetching calendar details:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching calendar details: " + error.message 
        });
    }
});

// Change calendar status (admin only)
router.put('/status/:id', verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (!status || !['active', 'obsolete'].includes(status)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid status. Status must be 'active' or 'obsolete'." 
            });
        }
        
        const [result] = await db.query(
            'UPDATE academic_calendars SET status = ? WHERE id = ?', 
            [status, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "Calendar not found." 
            });
        }
        
        res.json({ 
            success: true, 
            message: `Calendar status updated to '${status}'.` 
        });
    } catch (error) {
        console.error("Error updating calendar status:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error updating calendar status: " + error.message 
        });
    }
});

// Delete academic calendar (admin only)
router.delete('/delete/:id', verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        
        const [result] = await db.query('DELETE FROM academic_calendars WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "Calendar not found." 
            });
        }
        
        res.json({ 
            success: true, 
            message: "Academic calendar deleted successfully!" 
        });
    } catch (error) {
        console.error("Error deleting academic calendar:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error deleting academic calendar: " + error.message 
        });
    }
});

export default router;