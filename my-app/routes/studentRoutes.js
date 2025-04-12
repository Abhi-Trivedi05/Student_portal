import express from 'express';
import db from '../database/db.js';

const router = express.Router();

// Middleware to verify student role
const verifyStudent = (req, res, next) => {
    const role = req.header('Role');
    const studentId = req.header('StudentId');

    if (!role || !studentId) {
        return res.status(401).json({ 
            success: false, 
            message: "Authorization denied: Incomplete credentials." 
        });
    }

    if (role !== 'student') {
        return res.status(403).json({ 
            success: false, 
            message: "Access denied: Student role required." 
        });
    }

    req.studentId = studentId;
    next();
};

// Get student profile
router.get('/:studentId', async (req, res) => {
    const { studentId } = req.params;
    
    try {
        const [student] = await db.query(
            `SELECT student_id, name, programme, department, cpi, current_semester, batch, faculty_advisor_id 
             FROM students 
             WHERE student_id = ? AND status = 'active'`, 
            [studentId]
        );
        
        if (!student || student.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "Student not found or account is inactive." 
            });
        }
        
        res.status(200).json(student[0]);
    } catch (error) {
        console.error("Error fetching student profile:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching student profile." 
        });
    }
});

// Get student's courses
router.get('/courses/:studentId', async (req, res) => {
    const { studentId } = req.params;
    const currentYear = new Date().getFullYear();
    
    try {
        // First, get the current academic year
        const [academicYear] = await db.query(
            'SELECT id FROM academic_years WHERE is_current = true'
        );
        
        if (!academicYear || academicYear.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "Current academic year not found." 
            });
        }
        
        const academicYearId = academicYear[0].id;
        
        // Get student's current semester
        const [studentData] = await db.query(
            'SELECT current_semester FROM students WHERE student_id = ?',
            [studentId]
        );
        
        if (!studentData || studentData.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "Student not found." 
            });
        }
        
        const currentSemester = studentData[0].current_semester;
        
        // Get the courses for the student in the current semester and academic year
        const [courses] = await db.query(
            `SELECT c.id, c.course_code, c.course_name, c.credits, c.department,
                    cs.is_elective, cs.grade, cs.status, f.name as faculty_name
             FROM course_selections cs
             JOIN courses c ON cs.course_id = c.id
             LEFT JOIN semester_course_offerings sco ON c.id = sco.course_id AND sco.semester = ? AND sco.academic_year_id = ?
             LEFT JOIN faculty f ON sco.faculty_id = f.id
             WHERE cs.student_id = ? 
             AND cs.semester = ? 
             AND cs.academic_year_id = ?
             AND cs.status != 'Dropped'
             AND c.status = 'active'`,
            [currentSemester, academicYearId, studentId, currentSemester, academicYearId]
        );
        
        res.status(200).json({ courses });
    } catch (error) {
        console.error("Error fetching student courses:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching student courses: " + error.message 
        });
    }
});

// Get all available courses for registration
router.get('/registration/available-courses', verifyStudent, async (req, res) => {
    try {
        // Get the current academic year
        const [academicYear] = await db.query(
            'SELECT id FROM academic_years WHERE is_current = true'
        );
        
        if (!academicYear || academicYear.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "Current academic year not found." 
            });
        }
        
        const academicYearId = academicYear[0].id;
        
        // Get student's current semester
        const [studentData] = await db.query(
            'SELECT current_semester, programme, department FROM students WHERE student_id = ?',
            [req.studentId]
        );
        
        if (!studentData || studentData.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "Student not found." 
            });
        }
        
        const { current_semester, programme, department } = studentData[0];
        
        // Get available courses for registration
        const [availableCourses] = await db.query(
            `SELECT c.id, c.course_code, c.course_name, c.credits, c.department,
                    sco.id as offering_id, sco.max_seats, sco.available_seats, 
                    sco.registration_deadline, f.name as faculty_name
             FROM semester_course_offerings sco
             JOIN courses c ON sco.course_id = c.id
             JOIN faculty f ON sco.faculty_id = f.id
             WHERE sco.semester = ?
             AND sco.academic_year_id = ?
             AND sco.available_seats > 0
             AND sco.registration_deadline >= CURDATE()
             AND c.status = 'active'
             AND (c.department = ? OR c.department = 'Common')
             AND NOT EXISTS (
                 SELECT 1 FROM course_selections cs 
                 WHERE cs.student_id = ? 
                 AND cs.course_id = c.id 
                 AND cs.semester = sco.semester 
                 AND cs.academic_year_id = sco.academic_year_id
             )`,
            [current_semester, academicYearId, department, req.studentId]
        );
        
        res.status(200).json({ courses: availableCourses });
    } catch (error) {
        console.error("Error fetching available courses:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching available courses: " + error.message 
        });
    }
});

// Register for a course
router.post('/register-course', verifyStudent, async (req, res) => {
    const { offeringId } = req.body;
    
    if (!offeringId) {
        return res.status(400).json({
            success: false,
            message: "Course offering ID is required."
        });
    }
    
    try {
        // Begin transaction
        await db.query('START TRANSACTION');
        
        // Get course offering details
        const [offering] = await db.query(
            `SELECT course_id, semester, academic_year_id, available_seats, registration_deadline 
             FROM semester_course_offerings 
             WHERE id = ?`,
            [offeringId]
        );
        
        if (!offering || offering.length === 0) {
            await db.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: "Course offering not found."
            });
        }
        
        const courseOffering = offering[0];
        
        // Check if registration deadline has passed
        if (new Date(courseOffering.registration_deadline) < new Date()) {
            await db.query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: "Registration deadline has passed for this course."
            });
        }
        
        // Check if seats are available
        if (courseOffering.available_seats <= 0) {
            await db.query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: "No seats available for this course."
            });
        }
        
        // Check if student already registered for this course
        const [existingRegistration] = await db.query(
            `SELECT id FROM course_selections 
             WHERE student_id = ? 
             AND course_id = ? 
             AND semester = ? 
             AND academic_year_id = ?`,
            [req.studentId, courseOffering.course_id, courseOffering.semester, courseOffering.academic_year_id]
        );
        
        if (existingRegistration && existingRegistration.length > 0) {
            await db.query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: "You are already registered for this course."
            });
        }
        
        // Register the student for the course
        await db.query(
            `INSERT INTO course_selections 
             (student_id, course_id, semester, academic_year_id, is_elective, selection_date, status) 
             VALUES (?, ?, ?, ?, ?, NOW(), 'Registered')`,
            [req.studentId, courseOffering.course_id, courseOffering.semester, courseOffering.academic_year_id, false]
        );
        
        // Update available seats
        await db.query(
            'UPDATE semester_course_offerings SET available_seats = available_seats - 1 WHERE id = ?',
            [offeringId]
        );
        
        // Check if semester registration exists for this student
        const [semesterReg] = await db.query(
            `SELECT id FROM semester_registrations 
             WHERE student_id = ? 
             AND semester = ? 
             AND academic_year_id = ?`,
            [req.studentId, courseOffering.semester, courseOffering.academic_year_id]
        );
        
        // If no semester registration exists, create one
        if (!semesterReg || semesterReg.length === 0) {
            await db.query(
                `INSERT INTO semester_registrations 
                 (student_id, semester, academic_year_id, registration_date, status) 
                 VALUES (?, ?, ?, CURDATE(), 'In Progress')`,
                [req.studentId, courseOffering.semester, courseOffering.academic_year_id]
            );
        }
        
        // Commit transaction
        await db.query('COMMIT');
        
        res.json({
            success: true,
            message: "Successfully registered for the course."
        });
    } catch (error) {
        // Rollback in case of error
        await db.query('ROLLBACK');
        
        console.error("Error registering for course:", error);
        res.status(500).json({
            success: false,
            message: "Error registering for course: " + error.message
        });
    }
});

// Drop a course
router.post('/drop-course', verifyStudent, async (req, res) => {
    const { courseId, semester, academicYearId } = req.body;
    
    if (!courseId || !semester || !academicYearId) {
        return res.status(400).json({
            success: false,
            message: "Course ID, semester, and academic year ID are required."
        });
    }
    
    try {
        // Begin transaction
        await db.query('START TRANSACTION');
        
        // Check if the course can be dropped (registration deadline hasn't passed)
        const [offering] = await db.query(
            `SELECT id, registration_deadline 
             FROM semester_course_offerings 
             WHERE course_id = ? 
             AND semester = ? 
             AND academic_year_id = ?`,
            [courseId, semester, academicYearId]
        );
        
        if (offering && offering.length > 0) {
            const courseOffering = offering[0];
            
            // If deadline has passed, don't allow dropping
            if (new Date(courseOffering.registration_deadline) < new Date()) {
                await db.query('ROLLBACK');
                return res.status(400).json({
                    success: false,
                    message: "Course drop deadline has passed."
                });
            }
            
            // Update course selection status to 'Dropped'
            const [updateResult] = await db.query(
                `UPDATE course_selections 
                 SET status = 'Dropped' 
                 WHERE student_id = ? 
                 AND course_id = ? 
                 AND semester = ? 
                 AND academic_year_id = ?`,
                [req.studentId, courseId, semester, academicYearId]
            );
            
            if (updateResult.affectedRows === 0) {
                await db.query('ROLLBACK');
                return res.status(404).json({
                    success: false,
                    message: "Course selection not found."
                });
            }
            
            // Increase available seats
            await db.query(
                'UPDATE semester_course_offerings SET available_seats = available_seats + 1 WHERE id = ?',
                [courseOffering.id]
            );
        } else {
            // If no offering found, just update the course selection
            const [updateResult] = await db.query(
                `UPDATE course_selections 
                 SET status = 'Dropped' 
                 WHERE student_id = ? 
                 AND course_id = ? 
                 AND semester = ? 
                 AND academic_year_id = ?`,
                [req.studentId, courseId, semester, academicYearId]
            );
            
            if (updateResult.affectedRows === 0) {
                await db.query('ROLLBACK');
                return res.status(404).json({
                    success: false,
                    message: "Course selection not found."
                });
            }
        }
        
        // Commit transaction
        await db.query('COMMIT');
        
        res.json({
            success: true,
            message: "Successfully dropped the course."
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

// Get student's fee transactions
router.get('/fees/:studentId', async (req, res) => {
    const { studentId } = req.params;
    
    try {
        // Get current academic year
        const [academicYear] = await db.query(
            'SELECT id FROM academic_years WHERE is_current = true'
        );
        
        if (!academicYear || academicYear.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "Current academic year not found." 
            });
        }
        
        const academicYearId = academicYear[0].id;
        
        // Get student's fee transactions
        const [transactions] = await db.query(
            `SELECT id, transaction_date, bank_name, amount, reference_number, status, semester
             FROM fee_transactions
             WHERE student_id = ?
             ORDER BY transaction_date DESC`,
            [studentId]
        );
        
        // Get pending fee information
        const [studentSemester] = await db.query(
            'SELECT current_semester FROM students WHERE student_id = ?',
            [studentId]
        );
        
        if (!studentSemester || studentSemester.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "Student not found." 
            });
        }
        
        const currentSemester = studentSemester[0].current_semester;
        
        // Check if fee is paid for current semester
        const [currentSemesterFee] = await db.query(
            `SELECT id FROM fee_transactions 
             WHERE student_id = ? 
             AND semester = ? 
             AND academic_year_id = ? 
             AND status = 'Paid'`,
            [studentId, currentSemester, academicYearId]
        );
        
        const feeStatus = {
            currentSemester,
            isPaid: currentSemesterFee && currentSemesterFee.length > 0,
            academicYear: academicYearId
        };
        
        res.status(200).json({ 
            transactions,
            feeStatus
        });
    } catch (error) {
        console.error("Error fetching fee transactions:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching fee transactions: " + error.message 
        });
    }
});

// Submit fee payment
router.post('/submit-fee', verifyStudent, async (req, res) => {
    const { transaction_date, bank_name, amount, reference_number, semester } = req.body;
    
    if (!transaction_date || !bank_name || !amount || !reference_number || !semester) {
        return res.status(400).json({
            success: false,
            message: "All fields are required."
        });
    }
    
    try {
        // Get current academic year
        const [academicYear] = await db.query(
            'SELECT id FROM academic_years WHERE is_current = true'
        );
        
        if (!academicYear || academicYear.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Current academic year not found."
            });
        }
        
        const academicYearId = academicYear[0].id;
        
        // Check if reference number is already used
        const [existingRef] = await db.query(
            'SELECT id FROM fee_transactions WHERE reference_number = ?',
            [reference_number]
        );
        
        if (existingRef && existingRef.length > 0) {
            return res.status(400).json({
                success: false,
                message: "This reference number has already been used."
            });
        }
        
        // Submit fee payment (initially as pending)
        await db.query(
            `INSERT INTO fee_transactions 
             (student_id, academic_year_id, transaction_date, bank_name, amount, reference_number, status, semester, submission_date)
             VALUES (?, ?, ?, ?, ?, ?, 'Pending', ?, NOW())`,
            [req.studentId, academicYearId, transaction_date, bank_name, amount, reference_number, semester]
        );
        
        res.status(201).json({
            success: true,
            message: "Fee payment submitted successfully. It will be verified by the accounts department."
        });
    } catch(error) {
        console.error("Error submitting fee payment:", error);
        res.status(500).json({
            success: false,
            message: "Error submitting fee payment: " + error.message
        });
    }
});
// Get student's academic history
router.get('/academic-history/:studentId', async (req, res) => {
    const { studentId } = req.params;
    
    try {
        // Get student's completed courses with grades
        const [courses] = await db.query(
            `SELECT c.course_code, c.course_name, c.credits, cs.semester, 
                    cs.grade, ay.year_name as academic_year
             FROM course_selections cs
             JOIN courses c ON cs.course_id = c.id
             JOIN academic_years ay ON cs.academic_year_id = ay.id
             WHERE cs.student_id = ? 
             AND cs.status = 'Completed'
             AND cs.grade IS NOT NULL
             ORDER BY ay.year_name ASC, cs.semester ASC`,
            [studentId]
        );
        
        // Get semester-wise GPA
        const [semesterGPA] = await db.query(
            `SELECT cs.semester, ay.year_name as academic_year, 
                    SUM(c.credits * CASE 
                        WHEN cs.grade = 'A+' THEN 10
                        WHEN cs.grade = 'A' THEN 9
                        WHEN cs.grade = 'B+' THEN 8
                        WHEN cs.grade = 'B' THEN 7
                        WHEN cs.grade = 'C+' THEN 6
                        WHEN cs.grade = 'C' THEN 5
                        WHEN cs.grade = 'D' THEN 4
                        ELSE 0
                    END) / SUM(c.credits) as gpa,
                    SUM(c.credits) as total_credits
             FROM course_selections cs
             JOIN courses c ON cs.course_id = c.id
             JOIN academic_years ay ON cs.academic_year_id = ay.id
             WHERE cs.student_id = ? 
             AND cs.status = 'Completed'
             AND cs.grade IS NOT NULL
             GROUP BY cs.semester, ay.year_name
             ORDER BY ay.year_name ASC, cs.semester ASC`,
            [studentId]
        );
        
        // Get current CPI
        const [cpiData] = await db.query(
            `SELECT cpi FROM students WHERE student_id = ?`,
            [studentId]
        );
        
        const cpi = cpiData && cpiData.length > 0 ? cpiData[0].cpi : null;
        
        res.status(200).json({
            courses,
            semesterGPA,
            cpi
        });
    } catch (error) {
        console.error("Error fetching academic history:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching academic history: " + error.message 
        });
    }
});

// Update student profile (limited fields)
router.put('/update-profile', verifyStudent, async (req, res) => {
    const { phone, email, emergency_contact, address } = req.body;
    
    try {
        // Update student profile
        await db.query(
            `UPDATE student_details 
             SET phone = ?, email = ?, emergency_contact = ?, address = ?, last_updated = NOW()
             WHERE student_id = ?`,
            [phone, email, emergency_contact, address, req.studentId]
        );
        
        res.status(200).json({
            success: true,
            message: "Profile updated successfully."
        });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({
            success: false,
            message: "Error updating profile: " + error.message
        });
    }
});

// Finalize semester registration
router.post('/finalize-registration', verifyStudent, async (req, res) => {
    const { semester, academicYearId } = req.body;
    
    if (!semester || !academicYearId) {
        return res.status(400).json({
            success: false,
            message: "Semester and academic year ID are required."
        });
    }
    
    try {
        // Begin transaction
        await db.query('START TRANSACTION');
        
        // Check if fee is paid for the semester
        const [feePaid] = await db.query(
            `SELECT id FROM fee_transactions 
             WHERE student_id = ? 
             AND semester = ? 
             AND academic_year_id = ? 
             AND status IN ('Paid', 'Pending')`,
            [req.studentId, semester, academicYearId]
        );
        
        if (!feePaid || feePaid.length === 0) {
            await db.query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: "Fee payment is required before finalizing registration."
            });
        }
        
        // Check if student has registered for at least one course
        const [courses] = await db.query(
            `SELECT id FROM course_selections 
             WHERE student_id = ? 
             AND semester = ? 
             AND academic_year_id = ? 
             AND status = 'Registered'`,
            [req.studentId, semester, academicYearId]
        );
        
        if (!courses || courses.length === 0) {
            await db.query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: "You must register for at least one course."
            });
        }
        
        // Update semester registration status
        const [updateResult] = await db.query(
            `UPDATE semester_registrations 
             SET status = 'Completed', completion_date = NOW()
             WHERE student_id = ? 
             AND semester = ? 
             AND academic_year_id = ?`,
            [req.studentId, semester, academicYearId]
        );
        
        if (updateResult.affectedRows === 0) {
            // If no record exists, create one
            await db.query(
                `INSERT INTO semester_registrations 
                 (student_id, semester, academic_year_id, registration_date, completion_date, status) 
                 VALUES (?, ?, ?, NOW(), NOW(), 'Completed')`,
                [req.studentId, semester, academicYearId]
            );
        }
        
        // Commit transaction
        await db.query('COMMIT');
        
        res.status(200).json({
            success: true,
            message: "Semester registration finalized successfully."
        });
    } catch (error) {
        // Rollback in case of error
        await db.query('ROLLBACK');
        
        console.error("Error finalizing registration:", error);
        res.status(500).json({
            success: false,
            message: "Error finalizing registration: " + error.message
        });
    }
});

// Get student's attendance
router.get('/attendance/:studentId/:courseId', async (req, res) => {
    const { studentId, courseId } = req.params;
    
    try {
        // Get current academic year
        const [academicYear] = await db.query(
            'SELECT id FROM academic_years WHERE is_current = true'
        );
        
        if (!academicYear || academicYear.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "Current academic year not found." 
            });
        }
        
        const academicYearId = academicYear[0].id;
        
        // Get student's semester
        const [studentData] = await db.query(
            'SELECT current_semester FROM students WHERE student_id = ?',
            [studentId]
        );
        
        if (!studentData || studentData.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "Student not found." 
            });
        }
        
        const currentSemester = studentData[0].current_semester;
        
        // Get attendance records
        const [attendance] = await db.query(
            `SELECT a.date, a.status, c.course_name
             FROM attendance a
             JOIN courses c ON a.course_id = c.id
             WHERE a.student_id = ? 
             AND a.course_id = ?
             AND a.semester = ?
             AND a.academic_year_id = ?
             ORDER BY a.date DESC`,
            [studentId, courseId, currentSemester, academicYearId]
        );
        
        // Calculate attendance percentage
        const totalClasses = attendance.length;
        const presentClasses = attendance.filter(record => record.status === 'Present').length;
        const attendancePercentage = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 0;
        
        res.status(200).json({
            attendance,
            summary: {
                totalClasses,
                presentClasses,
                absentClasses: totalClasses - presentClasses,
                attendancePercentage: Math.round(attendancePercentage * 10) / 10
            }
        });
    } catch (error) {
        console.error("Error fetching attendance:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching attendance: " + error.message 
        });
    }
});

export default router;