import express from 'express';
import db from '../database/db.js';

const router = express.Router();

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

// Helper function to get current academic year
const getCurrentAcademicYear = async () => {
    try {
        const [results] = await db.query('SELECT id FROM academic_years WHERE is_current = TRUE LIMIT 1');
        if (!results || results.length === 0) {
            throw new Error("No current academic year found. Please set a current academic year.");
        }
        return results[0].id;
    } catch (error) {
        throw error;
    }
};

// Add Faculty Route (Admin only)
router.post('/add-faculty', verifyAdmin, async (req, res) => {
    const { name, department, qualifications, email, phone_number, password } = req.body;
    
    // Validate required fields
    if (!name || !department || !email || !password) {
        return res.status(400).json({ 
            success: false, 
            message: "Please provide all required fields: name, department, email, and password." 
        });
    }
    
    try {
        // Store password directly without hashing
        const query = 'INSERT INTO faculty (name, department, qualifications, email, phone_number, password) VALUES (?, ?, ?, ?, ?, ?)';
        await db.query(query, [name, department, qualifications, email, phone_number, password]);
        
        res.json({ success: true, message: "Faculty added successfully!" });
    } catch (error) {
        console.error("Error adding faculty:", error);
        
        // Handle duplicate email or phone error
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ 
                success: false, 
                message: "Email or phone number already exists." 
            });
        }
        
        res.status(500).json({ success: false, message: "Error adding faculty." });
    }
});

// Add Student Route (Admin only)
router.post('/add-student', verifyAdmin, async (req, res) => {
    const { student_id, name, programme, department, cpi, current_semester, batch, faculty_advisor_id, password } = req.body;
    
    // Validate required fields
    if (!student_id || !name || !programme || !department || !current_semester || !batch || !password) {
        return res.status(400).json({ 
            success: false, 
            message: "Please provide all required fields including password." 
        });
    }
    
    try {
        // Store password directly without hashing
        const query = 'INSERT INTO students (student_id, name, programme, department, cpi, current_semester, batch, faculty_advisor_id, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
        await db.query(query, [student_id, name, programme, department, cpi, current_semester, batch, faculty_advisor_id, password]);
        
        res.json({ success: true, message: "Student added successfully!" });
    } catch (error) {
        console.error("Error adding student:", error);
        
        // Handle duplicate student_id error
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ 
                success: false, 
                message: "Student ID already exists." 
            });
        }
        
        res.status(500).json({ success: false, message: "Error adding student." });
    }
});

// Add Course Route (Admin only) - UPDATED
router.post('/add-course', verifyAdmin, async (req, res) => {
    const { course_code, course_name, credits, department, faculty_id, semesters, max_seats } = req.body;
    
    // Validate required fields
    if (!course_code || !course_name || !credits || !department) {
        return res.status(400).json({ 
            success: false, 
            message: "Please provide all required fields: course code, name, credits, and department." 
        });
    }
    
    // Validate semesters array
    if (!semesters || !Array.isArray(semesters) || semesters.length === 0) {
        return res.status(400).json({ 
            success: false, 
            message: "Please provide at least one semester for which this course is offered." 
        });
    }
    
    // Validate faculty assignment
    if (!faculty_id) {
        return res.status(400).json({ 
            success: false, 
            message: "Please provide a faculty ID for the course." 
        });
    }
    
    try {
        // Get current academic year
        const currentAcademicYearId = await getCurrentAcademicYear();
        
        // Begin transaction
        await db.query('START TRANSACTION');
        
        // 1. First insert the course
        const courseQuery = 'INSERT INTO courses (course_code, course_name, credits, department) VALUES (?, ?, ?, ?)';
        const [courseResult] = await db.query(courseQuery, [
            course_code, 
            course_name, 
            Number(credits), // Ensure credits is a number
            department
        ]);
        
        // 2. Get the newly inserted course id
        const courseId = courseResult.insertId;
        
        // 3. Insert into semester_course_offerings table for each semester
        for (const semester of semesters) {
            const seatsCount = max_seats || 60; // Default to 60 if not specified
            const offeringQuery = `
                INSERT INTO semester_course_offerings 
                (course_id, semester, academic_year_id, max_seats, available_seats, faculty_id) 
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            
            await db.query(offeringQuery, [
                courseId,
                Number(semester),
                currentAcademicYearId,
                seatsCount,
                seatsCount, // Initially available seats equals max seats
                Number(faculty_id)
            ]);
        }
        
        // Commit transaction
        await db.query('COMMIT');
        
        res.json({ 
            success: true, 
            message: "Course added successfully and offered to specified semesters!" 
        });
    } catch (error) {
        // Rollback in case of error
        await db.query('ROLLBACK');
        
        console.error("Error adding course:", error);
        
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ 
                success: false, 
                message: "Course with this code already exists." 
            });
        } else if (error.code === 'ER_NO_REFERENCED_ROW') {
            return res.status(400).json({ 
                success: false, 
                message: "The faculty ID provided does not exist." 
            });
        } else if (error.message.includes("academic year")) {
            return res.status(400).json({ 
                success: false, 
                message: error.message 
            });
        } else {
            return res.status(500).json({ 
                success: false, 
                message: "Error adding course: " + error.message
            });
        }
    }
});

// Get Courses Route (Admin only) - UPDATED
router.get('/get-courses', verifyAdmin, async (req, res) => {
    try {
        // Join courses with semester_course_offerings and faculty to get complete information
        const query = `
            SELECT c.id, c.course_code, c.course_name, c.credits, c.department, c.status,
                   sco.semester, sco.max_seats, sco.available_seats, sco.registration_deadline,
                   f.id as faculty_id, f.name as faculty_name, ay.year_name as academic_year
            FROM courses c
            LEFT JOIN semester_course_offerings sco ON c.id = sco.course_id
            LEFT JOIN faculty f ON sco.faculty_id = f.id
            LEFT JOIN academic_years ay ON sco.academic_year_id = ay.id
            ORDER BY c.course_code, sco.semester
        `;
        
        const [results] = await db.query(query);
        
        if (!results || results.length === 0) {
            return res.status(404).json({ success: false, message: 'No courses found.' });
        }
        
        // Group courses by course ID for better organization
        const coursesMap = {};
        
        results.forEach(row => {
            if (!coursesMap[row.id]) {
                coursesMap[row.id] = {
                    id: row.id,
                    course_code: row.course_code,
                    course_name: row.course_name,
                    credits: row.credits,
                    department: row.department,
                    status: row.status,
                    offerings: []
                };
            }
            
            // Add offering details if they exist
            if (row.semester) {
                coursesMap[row.id].offerings.push({
                    semester: row.semester,
                    max_seats: row.max_seats,
                    available_seats: row.available_seats,
                    registration_deadline: row.registration_deadline,
                    faculty_id: row.faculty_id,
                    faculty_name: row.faculty_name,
                    academic_year: row.academic_year
                });
            }
        });
        
        // Convert map to array
        const courses = Object.values(coursesMap);
        
        res.status(200).json({ courses });
    } catch (error) {
        console.error("Error fetching courses:", error);
        res.status(500).json({ success: false, message: "Error fetching courses." });
    }
});

// Add Course Selection Route (for students) - UPDATED
router.post('/add-course-selection', async (req, res) => {
    const { student_id, course_id, is_elective } = req.body;
    
    if (!student_id || !course_id) {
        return res.status(400).json({ 
            success: false, 
            message: "Please provide student ID and course ID." 
        });
    }
    
    try {
        // Begin transaction
        await db.query('START TRANSACTION');
        
        // 1. Get student information
        const [studentResults] = await db.query(
            'SELECT current_semester FROM students WHERE student_id = ? AND status = "active"', 
            [student_id]
        );
        
        if (!studentResults || studentResults.length === 0) {
            await db.query('ROLLBACK');
            return res.status(404).json({ 
                success: false, 
                message: "Student not found or inactive." 
            });
        }
        
        const studentSemester = studentResults[0].current_semester;
        
        // 2. Get current academic year
        const currentAcademicYearId = await getCurrentAcademicYear();
        
        // 3. Check if the course is offered for the student's semester
        const [courseOfferingResults] = await db.query(
            `SELECT id, available_seats, registration_deadline 
             FROM semester_course_offerings 
             WHERE course_id = ? AND semester = ? AND academic_year_id = ?`,
            [course_id, studentSemester, currentAcademicYearId]
        );
        
        if (!courseOfferingResults || courseOfferingResults.length === 0) {
            await db.query('ROLLBACK');
            return res.status(400).json({ 
                success: false, 
                message: "This course is not offered for your current semester." 
            });
        }
        
        const courseOffering = courseOfferingResults[0];
        
        // 4. Check if registration deadline has passed
        if (courseOffering.registration_deadline) {
            const currentDate = new Date();
            const deadlineDate = new Date(courseOffering.registration_deadline);
            
            if (currentDate > deadlineDate) {
                await db.query('ROLLBACK');
                return res.status(400).json({ 
                    success: false, 
                    message: "Registration deadline has passed for this course." 
                });
            }
        }
        
        // 5. Check available seats
        if (courseOffering.available_seats <= 0) {
            await db.query('ROLLBACK');
            return res.status(400).json({ 
                success: false, 
                message: "No available seats for this course." 
            });
        }
        
        // 6. Check if student is already registered for this course
        const [existingRegistration] = await db.query(
            `SELECT id FROM course_selections 
             WHERE student_id = ? AND course_id = ? AND semester = ? AND academic_year_id = ?`,
            [student_id, course_id, studentSemester, currentAcademicYearId]
        );
        
        if (existingRegistration && existingRegistration.length > 0) {
            await db.query('ROLLBACK');
            return res.status(400).json({ 
                success: false, 
                message: "You are already registered for this course." 
            });
        }
        
        // 7. Register the student for the course
        await db.query(
            `INSERT INTO course_selections 
             (student_id, course_id, semester, academic_year_id, is_elective) 
             VALUES (?, ?, ?, ?, ?)`,
            [student_id, course_id, studentSemester, currentAcademicYearId, is_elective || false]
        );
        
        // 8. Update available seats
        await db.query(
            'UPDATE semester_course_offerings SET available_seats = available_seats - 1 WHERE id = ?',
            [courseOffering.id]
        );
        
        // Commit transaction
        await db.query('COMMIT');
        
        return res.json({ 
            success: true, 
            message: "Course selection added successfully!" 
        });
    } catch (error) {
        // Rollback in case of error
        await db.query('ROLLBACK');
        
        console.error("Error adding course selection:", error);
        
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ 
                success: false, 
                message: "You are already registered for this course." 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: "Error adding course selection: " + error.message 
        });
    }
});

// Get Course Selections for a Student - UPDATED
router.get('/get-course-selections/:student_id', async (req, res) => {
    const { student_id } = req.params;
    
    try {
        const query = `
            SELECT cs.id, cs.student_id, cs.semester, cs.is_elective, cs.grade, cs.status,
                   c.id as course_id, c.course_code, c.course_name, c.credits, c.department,
                   f.name as faculty_name, ay.year_name as academic_year
            FROM course_selections cs
            JOIN courses c ON cs.course_id = c.id
            JOIN semester_course_offerings sco ON c.id = sco.course_id AND cs.semester = sco.semester AND cs.academic_year_id = sco.academic_year_id
            JOIN faculty f ON sco.faculty_id = f.id
            JOIN academic_years ay ON cs.academic_year_id = ay.id
            WHERE cs.student_id = ?
            ORDER BY cs.semester DESC, c.course_code
        `;
        
        const [results] = await db.query(query, [student_id]);
        
        if (!results || results.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'No course selections found for this student.' 
            });
        }
        
        res.status(200).json({ course_selections: results });
    } catch (error) {
        console.error("Error fetching course selections:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching course selections: " + error.message 
        });
    }
});

// Drop Course Selection Route - NEW
router.post('/drop-course', async (req, res) => {
    const { student_id, course_id } = req.body;
    
    if (!student_id || !course_id) {
        return res.status(400).json({ 
            success: false, 
            message: "Please provide student ID and course ID." 
        });
    }
    
    try {
        // Begin transaction
        await db.query('START TRANSACTION');
        
        // 1. Get current academic year
        const currentAcademicYearId = await getCurrentAcademicYear();
        
        // 2. Get student's semester
        const [studentResults] = await db.query(
            'SELECT current_semester FROM students WHERE student_id = ?', 
            [student_id]
        );
        
        if (!studentResults || studentResults.length === 0) {
            await db.query('ROLLBACK');
            return res.status(404).json({ 
                success: false, 
                message: "Student not found." 
            });
        }
        
        const studentSemester = studentResults[0].current_semester;
        
        // 3. Find the course selection to drop
        const [selectionResults] = await db.query(
            `SELECT id FROM course_selections 
             WHERE student_id = ? AND course_id = ? AND semester = ? AND academic_year_id = ? AND status = 'Registered'`,
            [student_id, course_id, studentSemester, currentAcademicYearId]
        );
        
        if (!selectionResults || selectionResults.length === 0) {
            await db.query('ROLLBACK');
            return res.status(404).json({ 
                success: false, 
                message: "Course selection not found or not in 'Registered' status." 
            });
        }
        
        const selectionId = selectionResults[0].id;
        
        // 4. Update the course selection status to 'Dropped'
        await db.query(
            'UPDATE course_selections SET status = "Dropped" WHERE id = ?',
            [selectionId]
        );
        
        // 5. Increase available seats in semester_course_offerings
        await db.query(
            `UPDATE semester_course_offerings 
             SET available_seats = available_seats + 1 
             WHERE course_id = ? AND semester = ? AND academic_year_id = ?`,
            [course_id, studentSemester, currentAcademicYearId]
        );
        
        // Commit transaction
        await db.query('COMMIT');
        
        return res.json({ 
            success: true, 
            message: "Course dropped successfully!" 
        });
    } catch (error) {
        // Rollback in case of error
        await db.query('ROLLBACK');
        
        console.error("Error dropping course:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error dropping course: " + error.message 
        });
    }
});

// Get Available Courses for a Student - NEW
router.get('/available-courses/:student_id', async (req, res) => {
    const { student_id } = req.params;
    
    try {
        // 1. Get student information
        const [studentResults] = await db.query(
            'SELECT current_semester, department FROM students WHERE student_id = ? AND status = "active"', 
            [student_id]
        );
        
        if (!studentResults || studentResults.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "Student not found or inactive." 
            });
        }
        
        const { current_semester, department } = studentResults[0];
        
        // 2. Get current academic year
        const currentAcademicYearId = await getCurrentAcademicYear();
        
        // 3. Get available courses for the student's semester
        const query = `
            SELECT c.id, c.course_code, c.course_name, c.credits, c.department,
                   sco.semester, sco.max_seats, sco.available_seats, sco.registration_deadline,
                   f.name as faculty_name
            FROM courses c
            JOIN semester_course_offerings sco ON c.id = sco.course_id
            JOIN faculty f ON sco.faculty_id = f.id
            WHERE sco.semester = ? 
              AND sco.academic_year_id = ?
              AND sco.available_seats > 0
              AND c.status = 'active'
              AND (c.department = ? OR c.department = 'Common')
              AND c.id NOT IN (
                SELECT course_id FROM course_selections 
                WHERE student_id = ? AND semester = ? AND academic_year_id = ? AND status != 'Dropped'
              )
            ORDER BY c.course_code
        `;
        
        const [results] = await db.query(query, [
            current_semester, 
            currentAcademicYearId,
            department,
            student_id,
            current_semester,
            currentAcademicYearId
        ]);
        
        if (!results || results.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'No available courses found for your semester.' 
            });
        }
        
        res.status(200).json({ available_courses: results });
    } catch (error) {
        console.error("Error fetching available courses:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching available courses: " + error.message 
        });
    }
});

// Add Fee Transaction Route - UPDATED
router.post('/add-fee-transaction', async (req, res) => {
    const { student_id, transaction_date, bank_name, amount, reference_number, semester } = req.body;
    
    if (!student_id || !transaction_date || !amount || !reference_number || !semester) {
        return res.status(400).json({ 
            success: false, 
            message: "Please provide all required fields: student ID, transaction date, amount, reference number, and semester." 
        });
    }
    
    try {
        // Get current academic year
        const currentAcademicYearId = await getCurrentAcademicYear();
        
        const query = `
            INSERT INTO fee_transactions 
            (student_id, transaction_date, bank_name, amount, reference_number, status, semester, academic_year_id) 
            VALUES (?, ?, ?, ?, ?, 'Pending', ?, ?)
        `;
        
        await db.query(query, [
            student_id, 
            transaction_date, 
            bank_name, 
            amount, 
            reference_number, 
            semester,
            currentAcademicYearId
        ]);
        
        res.json({ success: true, message: "Fee transaction added successfully!" });
    } catch (error) {
        console.error("Error adding fee transaction:", error);
        
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ 
                success: false, 
                message: "Transaction with this reference number already exists." 
            });
        }
        
        res.status(500).json({ success: false, message: "Error adding fee transaction." });
    }
});

// Get Fee Transactions for a Student - UPDATED
router.get('/get-fee-transactions/:student_id', async (req, res) => {
    const { student_id } = req.params;
    
    try {
        const query = `
            SELECT ft.*, ay.year_name as academic_year
            FROM fee_transactions ft
            JOIN academic_years ay ON ft.academic_year_id = ay.id
            WHERE ft.student_id = ?
            ORDER BY ft.transaction_date DESC
        `;
        
        const [results] = await db.query(query, [student_id]);
        
        if (!results || results.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'No fee transactions found for this student.' 
            });
        }
        
        res.status(200).json({ fee_transactions: results });
    } catch (error) {
        console.error("Error fetching fee transactions:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching fee transactions: " + error.message 
        });
    }
});

// Manage Academic Years - NEW
router.post('/add-academic-year', verifyAdmin, async (req, res) => {
    const { year_name, start_date, end_date, is_current } = req.body;
    
    if (!year_name || !start_date || !end_date) {
        return res.status(400).json({ 
            success: false, 
            message: "Please provide year name, start date, and end date." 
        });
    }
    
    try {
        // Begin transaction
        await db.query('START TRANSACTION');
        
        // If this year is set as current, reset all others
        if (is_current) {
            await db.query('UPDATE academic_years SET is_current = FALSE');
        }
        
        // Add the new academic year
        const query = `
            INSERT INTO academic_years (year_name, start_date, end_date, is_current)
            VALUES (?, ?, ?, ?)
        `;
        
        await db.query(query, [year_name, start_date, end_date, is_current || false]);
        
        // Commit transaction
        await db.query('COMMIT');
        
        res.json({ 
            success: true, 
            message: "Academic year added successfully!" 
        });
    } catch (error) {
        // Rollback in case of error
        await db.query('ROLLBACK');
        
        console.error("Error adding academic year:", error);
        
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ 
                success: false, 
                message: "Academic year with this name already exists." 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: "Error adding academic year: " + error.message 
        });
    }
});

// Get academic years
router.get('/academic-years', verifyAdmin, async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM academic_years ORDER BY start_date DESC');
        
        res.status(200).json({ academic_years: results });
    } catch (error) {
        console.error("Error fetching academic years:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching academic years: " + error.message 
        });
    }
});

// Set current academic year
router.put('/set-current-academic-year/:year_id', verifyAdmin, async (req, res) => {
    const { year_id } = req.params;
    
    try {
        // Begin transaction
        await db.query('START TRANSACTION');
        
        // Reset all years
        await db.query('UPDATE academic_years SET is_current = FALSE');
        
        // Set the selected year as current
        const [result] = await db.query(
            'UPDATE academic_years SET is_current = TRUE WHERE id = ?',
            [year_id]
        );
        
        if (result.affectedRows === 0) {
            await db.query('ROLLBACK');
            return res.status(404).json({ 
                success: false, 
                message: "Academic year not found." 
            });
        }
        
        // Commit transaction
        await db.query('COMMIT');
        
        res.json({ 
            success: true, 
            message: "Current academic year updated successfully!" 
        });
    } catch (error) {
        // Rollback in case of error
        await db.query('ROLLBACK');
        
        console.error("Error updating current academic year:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error updating current academic year: " + error.message 
        });
    }
});

// Get a single faculty by ID
router.get('/faculty/:faculty_id', verifyAdmin, async (req, res) => {
    const { faculty_id } = req.params;
    
    try {
        const [results] = await db.query('SELECT * FROM faculty WHERE id = ?', [faculty_id]);
        
        if (!results || results.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Faculty not found.' 
            });
        }
        
        // Don't send password in the response for security
        const faculty = results[0];
        // Uncomment the next line if you want to hide the password in the response
        // delete faculty.password;
        
        res.status(200).json(faculty);
    } catch (error) {
        console.error("Error fetching faculty:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching faculty: " + error.message 
        });
    }
});

// Edit Faculty Route (Admin only)
// Edit Faculty Route (Admin only) - Completing the code from where it was cut off
router.put('/edit-faculty/:faculty_id', verifyAdmin, async (req, res) => {
    const { faculty_id } = req.params;
    const { name, department, qualifications, email, phone_number, password, status } = req.body;
    
    try {
        // Start with base query
        let updateFields = [];
        let params = [];
        
        // Build query dynamically based on provided fields
        if (name !== undefined) {
            updateFields.push('name = ?');
            params.push(name);
        }
        
        if (department !== undefined) {
            updateFields.push('department = ?');
            params.push(department);
        }
        
        if (qualifications !== undefined) {
            updateFields.push('qualifications = ?');
            params.push(qualifications);
        }
        
        if (email !== undefined) {
            updateFields.push('email = ?');
            params.push(email);
        }
        
        if (phone_number !== undefined) {
            updateFields.push('phone_number = ?');
            params.push(phone_number);
        }
        
        if (status !== undefined) {
            updateFields.push('status = ?');
            params.push(status);
        }
        
        // Handle password update if provided and not empty
        if (password !== undefined && password.trim() !== '') {
            updateFields.push('password = ?');
            params.push(password);
        }
        
        // Check if there are fields to update
        if (updateFields.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: "No fields to update" 
            });
        }
        
        // Construct and execute the final query
        const query = `UPDATE faculty SET ${updateFields.join(', ')} WHERE id = ?`;
        params.push(faculty_id);
        
        const [result] = await db.query(query, params);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "Faculty not found or no changes made" 
            });
        }
        
        res.json({ 
            success: true, 
            message: "Faculty updated successfully!" 
        });
    } catch (error) {
        console.error("Error updating faculty:", error);
        
        // Handle duplicate email or phone error
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ 
                success: false, 
                message: "Email or phone number already exists." 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: "Error updating faculty: " + error.message 
        });
    }
});

// Completing API routes to ensure all essential functionality is available

// Set registration deadline for a course offering
router.put('/set-registration-deadline/:offering_id', verifyAdmin, async (req, res) => {
    const { offering_id } = req.params;
    const { registration_deadline } = req.body;
    
    if (!registration_deadline) {
        return res.status(400).json({ 
            success: false, 
            message: "Please provide a registration deadline date." 
        });
    }
    
    try {
        const query = 'UPDATE semester_course_offerings SET registration_deadline = ? WHERE id = ?';
        const [result] = await db.query(query, [registration_deadline, offering_id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "Course offering not found." 
            });
        }
        
        res.json({ 
            success: true, 
            message: "Registration deadline set successfully!" 
        });
    } catch (error) {
        console.error("Error setting registration deadline:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error setting registration deadline: " + error.message 
        });
    }
});

// Update course status (activate/deactivate)
router.put('/update-course-status/:course_id', verifyAdmin, async (req, res) => {
    const { course_id } = req.params;
    const { status } = req.body;
    
    if (!status || !['active', 'inactive'].includes(status)) {
        return res.status(400).json({ 
            success: false, 
            message: "Please provide a valid status (active or inactive)." 
        });
    }
    
    try {
        const query = 'UPDATE courses SET status = ? WHERE id = ?';
        const [result] = await db.query(query, [status, course_id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "Course not found." 
            });
        }
        
        res.json({ 
            success: true, 
            message: `Course status updated to '${status}' successfully!` 
        });
    } catch (error) {
        console.error("Error updating course status:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error updating course status: " + error.message 
        });
    }
});

// Update student's semester (promote students)
router.put('/update-student-semester', verifyAdmin, async (req, res) => {
    const { batch, current_semester, new_semester } = req.body;
    
    if (!batch || !current_semester || !new_semester) {
        return res.status(400).json({ 
            success: false, 
            message: "Please provide batch, current semester, and new semester." 
        });
    }
    
    try {
        const query = 'UPDATE students SET current_semester = ? WHERE batch = ? AND current_semester = ?';
        const [result] = await db.query(query, [new_semester, batch, current_semester]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "No students found with the specified batch and current semester." 
            });
        }
        
        res.json({ 
            success: true, 
            message: `Successfully updated ${result.affectedRows} students from semester ${current_semester} to ${new_semester}!` 
        });
    } catch (error) {
        console.error("Error updating student semester:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error updating student semester: " + error.message 
        });
    }
});

// Submit grades for students in a course
router.post('/submit-grades', verifyAdmin, async (req, res) => {
    const { course_id, semester, academic_year_id, grades } = req.body;
    
    if (!course_id || !semester || !academic_year_id || !grades || !Array.isArray(grades)) {
        return res.status(400).json({ 
            success: false, 
            message: "Please provide course ID, semester, academic year ID, and an array of student grades." 
        });
    }
    
    try {
        // Begin transaction
        await db.query('START TRANSACTION');
        
        // Process each grade submission
        for (const grade of grades) {
            if (!grade.student_id || !grade.grade) {
                continue; // Skip invalid entries
            }
            
            await db.query(
                `UPDATE course_selections 
                 SET grade = ?, status = 'Completed' 
                 WHERE student_id = ? AND course_id = ? AND semester = ? AND academic_year_id = ?`,
                [grade.grade, grade.student_id, course_id, semester, academic_year_id]
            );
        }
        
        // Update CPI for affected students
        // This is a simplified example - you might need a more complex CPI calculation
        const studentIds = grades.map(g => g.student_id);
        
        for (const studentId of studentIds) {
            // Get all completed courses with grades
            const [completedCourses] = await db.query(
                `SELECT cs.grade, c.credits 
                 FROM course_selections cs
                 JOIN courses c ON cs.course_id = c.id
                 WHERE cs.student_id = ? AND cs.status = 'Completed' AND cs.grade IS NOT NULL`,
                [studentId]
            );
            
            if (completedCourses.length > 0) {
                // Calculate CPI (simple average for this example)
                let totalPoints = 0;
                let totalCredits = 0;
                
                completedCourses.forEach(course => {
                    // Convert letter grade to points (simplified)
                    let points = 0;
                    switch (course.grade) {
                        case 'A': points = 10; break;
                        case 'A-': points = 9; break;
                        case 'B+': points = 8; break;
                        case 'B': points = 7; break;
                        case 'B-': points = 6; break;
                        case 'C+': points = 5; break;
                        case 'C': points = 4; break;
                        case 'D': points = 3; break;
                        case 'F': points = 0; break;
                        default: points = 0;
                    }
                    
                    totalPoints += points * course.credits;
                    totalCredits += course.credits;
                });
                
                const cpi = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0;
                
                // Update student CPI
                await db.query(
                    'UPDATE students SET cpi = ? WHERE student_id = ?',
                    [cpi, studentId]
                );
            }
        }
        
        // Commit transaction
        await db.query('COMMIT');
        
        res.json({ 
            success: true, 
            message: "Grades submitted successfully!" 
        });
    } catch (error) {
        // Rollback in case of error
        await db.query('ROLLBACK');
        
        console.error("Error submitting grades:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error submitting grades: " + error.message 
        });
    }
});

// Get students enrolled in a course
router.get('/course-enrollments/:course_id/:semester/:academic_year_id', verifyAdmin, async (req, res) => {
    const { course_id, semester, academic_year_id } = req.params;
    
    try {
        const query = `
            SELECT cs.id as selection_id, cs.student_id, cs.grade, cs.status, cs.is_elective,
                   s.name as student_name, s.programme, s.department, s.batch
            FROM course_selections cs
            JOIN students s ON cs.student_id = s.student_id
            WHERE cs.course_id = ? AND cs.semester = ? AND cs.academic_year_id = ? AND cs.status != 'Dropped'
            ORDER BY s.name
        `;
        
        const [results] = await db.query(query, [course_id, semester, academic_year_id]);
        
        if (!results || results.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'No students enrolled in this course for the specified semester and academic year.' 
            });
        }
        
        res.status(200).json({ 
            success: true, 
            enrollments: results 
        });
    } catch (error) {
        console.error("Error fetching course enrollments:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching course enrollments: " + error.message 
        });
    }
});

// Generate student transcripts
router.get('/generate-transcript/:student_id', async (req, res) => {
    const { student_id } = req.params;
    
    try {
        // Get student information
        const [studentResults] = await db.query(
            `SELECT name, programme, department, batch, cpi, current_semester 
             FROM students WHERE student_id = ?`,
            [student_id]
        );
        
        if (!studentResults || studentResults.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Student not found.' 
            });
        }
        
        const student = studentResults[0];
        
        // Get all courses taken by the student with grades
        const [courseResults] = await db.query(
            `SELECT cs.semester, cs.grade, cs.status, cs.is_elective,
                    c.course_code, c.course_name, c.credits, c.department,
                    ay.year_name as academic_year
             FROM course_selections cs
             JOIN courses c ON cs.course_id = c.id
             JOIN academic_years ay ON cs.academic_year_id = ay.id
             WHERE cs.student_id = ?
             ORDER BY cs.semester, c.course_code`,
            [student_id]
        );
        
        // Organize courses by semester
        const semesters = {};
        
        courseResults.forEach(course => {
            const semKey = `Semester ${course.semester}`;
            
            if (!semesters[semKey]) {
                semesters[semKey] = {
                    courses: [],
                    totalCredits: 0,
                    completedCredits: 0
                };
            }
            
            semesters[semKey].courses.push(course);
            
            if (course.status === 'Completed' && course.grade && course.grade !== 'F') {
                semesters[semKey].completedCredits += course.credits;
            }
            
            if (course.status !== 'Dropped') {
                semesters[semKey].totalCredits += course.credits;
            }
        });
        
        // Calculate overall statistics
        let totalCompletedCredits = 0;
        let totalCreditsAttempted = 0;
        
        Object.values(semesters).forEach(semester => {
            totalCompletedCredits += semester.completedCredits;
            totalCreditsAttempted += semester.totalCredits;
        });
        
        // Prepare the transcript data
        const transcript = {
            student: {
                id: student_id,
                name: student.name,
                programme: student.programme,
                department: student.department,
                batch: student.batch,
                current_semester: student.current_semester,
                cpi: student.cpi
            },
            semesters: semesters,
            summary: {
                total_semesters: Object.keys(semesters).length,
                total_courses: courseResults.length,
                completed_credits: totalCompletedCredits,
                total_credits_attempted: totalCreditsAttempted,
                cpi: student.cpi
            }
        };
        
        res.status(200).json({ 
            success: true, 
            transcript: transcript 
        });
    } catch (error) {
        console.error("Error generating transcript:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error generating transcript: " + error.message 
        });
    }
});

// Approve fee transaction
router.put('/approve-fee-transaction/:transaction_id', verifyAdmin, async (req, res) => {
    const { transaction_id } = req.params;
    const { status, remarks } = req.body;
    
    if (!status || !['Approved', 'Rejected'].includes(status)) {
        return res.status(400).json({ 
            success: false, 
            message: "Please provide a valid status (Approved or Rejected)." 
        });
    }
    
    try {
        const query = 'UPDATE fee_transactions SET status = ?, remarks = ? WHERE id = ?';
        const [result] = await db.query(query, [status, remarks || '', transaction_id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "Transaction not found." 
            });
        }
        
        res.json({ 
            success: true, 
            message: `Fee transaction ${status.toLowerCase()} successfully!` 
        });
    } catch (error) {
        console.error("Error updating fee transaction:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error updating fee transaction: " + error.message 
        });
    }
});

// Get pending fee transactions (Admin only)
router.get('/pending-fee-transactions', verifyAdmin, async (req, res) => {
    try {
        // Updated to include student names and more details
        const query = `
            SELECT ft.*, s.name as student_name, ay.year_name as academic_year
            FROM fee_transactions ft
            JOIN students s ON ft.student_id = s.student_id
            JOIN academic_years ay ON ft.academic_year_id = ay.id
            WHERE ft.status = 'Pending'
            ORDER BY ft.transaction_date DESC
        `;
        
        const [results] = await db.query(query);
        
        res.status(200).json({ 
            success: true, 
            pending_transactions: results 
        });
    } catch (error) {
        console.error("Error fetching pending fee transactions:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching pending fee transactions: " + error.message 
        });
    }
});

export default router;