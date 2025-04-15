import express from 'express';
import db from '../database/db.js';

const router = express.Router();
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
                    cs.grade, cs.status, f.name as faculty_name
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

// Get all available courses for registration with registration status
// Get all available courses for registration with registration status
router.get('/registration/available-courses', verifyStudent, async (req, res) => {
    try {
        console.log("Fetching courses for student ID:", req.studentId);
        
        // Get student's current semester
        const [studentData] = await db.query(
            'SELECT current_semester, programme, department FROM students WHERE student_id = ?',
            [req.studentId]
        );
        
        console.log("Student data:", studentData);
        
        if (!studentData || studentData.length === 0) {
            return res.status(404).json({ success: false, message: "Student not found." });
        }
        
        const { current_semester, department } = studentData[0];
        console.log("Current semester:", current_semester);
        
        // Get current academic year
        const [academicYear] = await db.query(
            'SELECT id FROM academic_years WHERE is_current = true'
        );
        
        console.log("Academic year data:", academicYear);
        
        if (!academicYear || academicYear.length === 0) {
            return res.status(404).json({ success: false, message: "Current academic year not found." });
        }
        
        const academicYearId = academicYear[0].id;
        console.log("Academic year ID:", academicYearId);
        
        // Check if semester course offerings exist
        const [courseOfferings] = await db.query(
            `SELECT COUNT(*) as count FROM semester_course_offerings 
             WHERE semester = ? AND academic_year_id = ?`,
            [current_semester, academicYearId]
        );
        
        console.log("Course offerings count:", courseOfferings[0].count);
        
        // Get all courses for the semester and student's already registered/pending courses
        // Modified to check for both 'Registered' and 'Pending' statuses
        const [courses] = await db.query(
            `SELECT 
                c.id, 
                c.course_code, 
                c.course_name, 
                c.credits, 
                c.department,
                sco.id as offering_id, 
                sco.max_seats, 
                sco.available_seats, 
                f.name as faculty_name,
                CASE 
                    WHEN cs.id IS NOT NULL AND cs.status = 'Registered' THEN TRUE 
                    ELSE FALSE 
                END as already_registered,
                CASE 
                    WHEN cs.id IS NOT NULL THEN cs.status 
                    ELSE NULL 
                END as selection_status
             FROM semester_course_offerings sco
             JOIN courses c ON sco.course_id = c.id
             JOIN faculty f ON sco.faculty_id = f.id
             LEFT JOIN course_selections cs ON c.id = cs.course_id AND cs.student_id = ? 
                                          AND cs.semester = ? AND cs.academic_year_id = ?
             WHERE sco.semester = ?
             AND sco.academic_year_id = ?
             AND c.status = 'active'`,
            [req.studentId, current_semester, academicYearId, current_semester, academicYearId]
        );
        
        console.log("Courses found:", courses.length);
        
        res.status(200).json({ 
            courses: courses,
            current_semester: current_semester
        });
    } catch (error) {
        console.error("Error fetching available courses:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching available courses: " + error.message 
        });
    }
});

// Register for a course
// router.post('/register-course', verifyStudent, async (req, res) => {
//     const { offeringId } = req.body;
    
//     if (!offeringId) {
//         return res.status(400).json({
//             success: false,
//             message: "Course offering ID is required."
//         });
//     }
    
//     try {
//         // Begin transaction
//         await db.query('START TRANSACTION');
        
//         // Get course offering details
//         const [offering] = await db.query(
//             `SELECT course_id, semester, academic_year_id, available_seats
//              FROM semester_course_offerings 
//              WHERE id = ?`,
//             [offeringId]
//         );
        
//         if (!offering || offering.length === 0) {
//             await db.query('ROLLBACK');
//             return res.status(404).json({
//                 success: false,
//                 message: "Course offering not found."
//             });
//         }
        
//         const courseOffering = offering[0];
        
//         // Check if seats are available
//         if (courseOffering.available_seats <= 0) {
//             await db.query('ROLLBACK');
//             return res.status(400).json({
//                 success: false,
//                 message: "No seats available for this course."
//             });
//         }
        
//         // Check if student already registered for this course
//         const [existingRegistration] = await db.query(
//             `SELECT id FROM course_selections 
//              WHERE student_id = ? 
//              AND course_id = ? 
//              AND semester = ? 
//              AND academic_year_id = ?
//              AND status = 'Registered'`,
//             [req.studentId, courseOffering.course_id, courseOffering.semester, courseOffering.academic_year_id]
//         );
        
//         if (existingRegistration && existingRegistration.length > 0) {
//             await db.query('ROLLBACK');
//             return res.status(400).json({
//                 success: false,
//                 message: "You are already registered for this course."
//             });
//         }
        
//         // Register the student for the course
//         await db.query(
//             `INSERT INTO course_selections 
//              (student_id, course_id, semester, academic_year_id, is_elective, selection_date, status) 
//              VALUES (?, ?, ?, ?, ?, NOW(), 'Registered')`,
//             [req.studentId, courseOffering.course_id, courseOffering.semester, courseOffering.academic_year_id, false]
//         );
        
//         // Update available seats
//         await db.query(
//             'UPDATE semester_course_offerings SET available_seats = available_seats - 1 WHERE id = ?',
//             [offeringId]
//         );
        
//         // Check if semester registration exists for this student
//         const [semesterReg] = await db.query(
//             `SELECT id FROM semester_registrations 
//              WHERE student_id = ? 
//              AND semester = ? 
//              AND academic_year_id = ?`,
//             [req.studentId, courseOffering.semester, courseOffering.academic_year_id]
//         );
        
//         // If no semester registration exists, create one
//         if (!semesterReg || semesterReg.length === 0) {
//             await db.query(
//                 `INSERT INTO semester_registrations 
//                  (student_id, semester, academic_year_id, registration_date, status) 
//                  VALUES (?, ?, ?, CURDATE(), 'In Progress')`,
//                 [req.studentId, courseOffering.semester, courseOffering.academic_year_id]
//             );
//         }
        
//         // Commit transaction
//         await db.query('COMMIT');
        
//         res.json({
//             success: true,
//             message: "Successfully registered for the course."
//         });
//     } catch (error) {
//         // Rollback in case of error
//         await db.query('ROLLBACK');
        
//         console.error("Error registering for course:", error);
//         res.status(500).json({
//             success: false,
//             message: "Error registering for course: " + error.message
//         });
//     }
// });
// Add this route to your studentRoutes.js file

// Select a course with Pending status
router.post('/select-course', verifyStudent, async (req, res) => {
    const { offeringId, courseId } = req.body;
    
    if (!offeringId || !courseId) {
        return res.status(400).json({
            success: false,
            message: "Course offering ID and course ID are required."
        });
    }
    
    try {
        // Begin transaction
        await db.query('START TRANSACTION');
        
        // Get course offering details
        const [offering] = await db.query(
            `SELECT semester, academic_year_id
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
        
        // Check if student already selected this course
        const [existingSelection] = await db.query(
            `SELECT id, status FROM course_selections 
             WHERE student_id = ? 
             AND course_id = ? 
             AND semester = ? 
             AND academic_year_id = ?`,
            [req.studentId, courseId, courseOffering.semester, courseOffering.academic_year_id]
        );
        
        // If already registered, don't change anything
        if (existingSelection && existingSelection.length > 0) {
            if (existingSelection[0].status === 'Registered') {
                await db.query('ROLLBACK');
                return res.status(400).json({
                    success: false,
                    message: "You are already registered for this course."
                });
            } else {
                // If already pending, don't need to do anything
                await db.query('COMMIT');
                return res.json({
                    success: true,
                    message: "Course already selected."
                });
            }
        }
        
       // Register the student for the course with Pending status
await db.query(
    `INSERT INTO course_selections 
     (student_id, course_id, semester, academic_year_id, status) 
     VALUES (?, ?, ?, ?, 'Pending')`,
    [req.studentId, courseId, courseOffering.semester, courseOffering.academic_year_id]
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
            message: "Course selected successfully."
        });
    } catch (error) {
        // Rollback in case of error
        await db.query('ROLLBACK');
        
        console.error("Error selecting course:", error);
        res.status(500).json({
            success: false,
            message: "Error selecting course: " + error.message
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
    const { transaction_date, bank_name, amount, reference_number, semester, academic_year_id} = req.body;
    console.log("Received fee submission:", req.body);
    if (!transaction_date || !bank_name || !amount || !reference_number || !semester) {
        return res.status(400).json({
            success: false,
            message: "All required fields must be provided."
        });
    }
    
    try {
        // Get current academic year if not provided
        let academicYearId = academic_year_id;
        if (!academicYearId) {
            const [academicYear] = await db.query(
                'SELECT id FROM academic_years WHERE is_current = true'
            );
            
            if (!academicYear || academicYear.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Current academic year not found."
                });
            }
            
            academicYearId = academicYear[0].id;
        }
        
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
        const [result] = await db.query(
            `INSERT INTO fee_transactions 
             (student_id, academic_year_id, transaction_date, bank_name, amount, reference_number, status, semester)
             VALUES (?, ?, ?, ?, ?, ?, 'Pending', ?)`,
            [req.studentId, academicYearId, transaction_date, bank_name, amount, reference_number, semester]
        );
        
        // Create fee approval record for admin to review
        if (result.insertId) {
            await db.query(
                `INSERT INTO fee_approvals 
                 (fee_transaction_id, admin_id, status)
                 VALUES (?, 1, 'Pending')`, // Using admin ID 1 as default reviewer
                [result.insertId]
            );
        }
        
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

// Submit semester registration with CPI and courses
router.post('/semester-registration', verifyStudent, async (req, res) => {
    const { student_id, semester, academic_year_id, cpi, courseIds } = req.body;
    
    if (!semester || !academic_year_id || !courseIds || courseIds.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Semester, academic year ID, and selected courses are required."
        });
    }
    
    try {
        // Begin transaction
        await db.query('START TRANSACTION');
        
        // Verify student ID matches the authenticated student
        if (student_id !== req.studentId) {
            await db.query('ROLLBACK');
            return res.status(403).json({
                success: false,
                message: "Unauthorized student ID."
            });
        }
        
        // Update student's CPI if provided
        if (cpi !== undefined && cpi !== null) {
            await db.query(
                'UPDATE students SET cpi = ? WHERE student_id = ?',
                [cpi, req.studentId]
            );
        }
        
        // Check if semester registration exists for this student
        const [semesterReg] = await db.query(
            `SELECT id FROM semester_registrations 
             WHERE student_id = ? 
             AND semester = ? 
             AND academic_year_id = ?`,
            [req.studentId, semester, academic_year_id]
        );
        
        let registrationId;
        
        if (semesterReg && semesterReg.length > 0) {
            // Update existing registration
            registrationId = semesterReg[0].id;
            await db.query(
                'UPDATE semester_registrations SET status = ? WHERE id = ?',
                ['In Progress', registrationId]
            );
        } else {
            // Create new registration
            const [result] = await db.query(
                `INSERT INTO semester_registrations 
                 (student_id, semester, academic_year_id, registration_date, status) 
                 VALUES (?, ?, ?, CURDATE(), 'In Progress')`,
                [req.studentId, semester, academic_year_id]
            );
            registrationId = result.insertId;
        }
        
        // Get the faculty advisor for this student
        const [faculty] = await db.query(
            'SELECT faculty_advisor_id FROM students WHERE student_id = ?',
            [req.studentId]
        );
        
        if (!faculty || faculty.length === 0 || !faculty[0].faculty_advisor_id) {
            await db.query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: "No faculty advisor assigned to this student."
            });
        }
        
        const facultyAdvisorId = faculty[0].faculty_advisor_id;
        
        // Create or update faculty approval record
        const [existingApproval] = await db.query(
            `SELECT id FROM faculty_registration_approvals 
             WHERE student_id = ? 
             AND semester = ? 
             AND academic_year_id = ?`,
            [req.studentId, semester, academic_year_id]
        );
        
        if (existingApproval && existingApproval.length > 0) {
            await db.query(
                `UPDATE faculty_registration_approvals 
                 SET status = 'Pending', faculty_id = ?, approval_date = NOW()
                 WHERE id = ?`,
                [facultyAdvisorId, existingApproval[0].id]
            );
        } else {
            await db.query(
                `INSERT INTO faculty_registration_approvals 
                 (student_id, semester, academic_year_id, faculty_id, status)
                 VALUES (?, ?, ?, ?, 'Pending')`,
                [req.studentId, semester, academic_year_id, facultyAdvisorId]
            );
        }
        
        // Commit transaction
        await db.query('COMMIT');
        
        res.status(200).json({
            success: true,
            message: "Semester registration submitted successfully. Waiting for faculty advisor approval."
        });
    } catch (error) {
        // Rollback in case of error
        await db.query('ROLLBACK');
        
        console.error("Error submitting semester registration:", error);
        res.status(500).json({
            success: false,
            message: "Error submitting semester registration: " + error.message
        });
    }
});

// Get registration status - NEW ROUTE
router.get('/registration-status', verifyStudent, async (req, res) => {
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
            [req.studentId]
        );
        
        if (!studentData || studentData.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }
        
        const currentSemester = studentData[0].current_semester;
        
        // Get registration status
        const [registration] = await db.query(
            `SELECT sr.status as registration_status,
                    fa.status as faculty_approval_status,
                    fa.remarks as faculty_remarks,
                    fee.status as fee_status
             FROM semester_registrations sr
             LEFT JOIN faculty_registration_approvals fa ON sr.student_id = fa.student_id
                                                     AND sr.semester = fa.semester
                                                     AND sr.academic_year_id = fa.academic_year_id
             LEFT JOIN fee_transactions ft ON sr.student_id = ft.student_id 
                                        AND sr.semester = ft.semester
                                        AND sr.academic_year_id = ft.academic_year_id
             LEFT JOIN fee_approvals fee ON ft.id = fee.fee_transaction_id
             WHERE sr.student_id = ?
             AND sr.semester = ?
             AND sr.academic_year_id = ?`,
            [req.studentId, currentSemester, academicYearId]
        );
        
        // Get registered courses
        const [courses] = await db.query(
            `SELECT c.id, c.course_code, c.course_name, c.credits
             FROM course_selections cs
             JOIN courses c ON cs.course_id = c.id
             WHERE cs.student_id = ?
             AND cs.semester = ?
             AND cs.academic_year_id = ?
             AND cs.status = 'Registered'`,
            [req.studentId, currentSemester, academicYearId]
        );
        
        res.status(200).json({
            registration: registration.length > 0 ? registration[0] : {
                registration_status: null,
                faculty_approval_status: null,
                fee_status: null
            },
            courses,
            semester: currentSemester,
            academicYear: academicYearId
        });
    } catch (error) {
        console.error("Error fetching registration status:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching registration status: " + error.message
        });
    }
});

// Get academic year - NEW ROUTE
router.get('/academic-year/current', async (req, res) => {
    try {
        const [academicYear] = await db.query(
            'SELECT id, year_name, start_date, end_date FROM academic_years WHERE is_current = true'
        );

        // console.log("Current Academic Year:", academicYear);
        
        if (!academicYear || academicYear.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Current academic year not found."
            });
        }
        
        res.status(200).json(academicYear[0]);
    } catch (error) {
        console.error("Error fetching current academic year:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching current academic year: " + error.message
        });
    }
});

// Update student profile
router.put('/update-profile', verifyStudent, async (req, res) => {
    const { phone, email, emergency_contact, address } = req.body;
    
    try {
      // First check if student_details record exists
      const [existingDetails] = await db.query(
        'SELECT id FROM student_details WHERE student_id = ?',
        [req.studentId]
      );
      
      if (existingDetails && existingDetails.length > 0) {
        // Update existing record
        await db.query(
          `UPDATE student_details 
           SET phone = ?, email = ?, emergency_contact = ?, address = ?, last_updated = NOW()
           WHERE student_id = ?`,
          [phone, email, emergency_contact, address, req.studentId]
        );
      } else {
        // Create new record
        await db.query(
          `INSERT INTO student_details 
           (student_id, phone, email, emergency_contact, address)
           VALUES (?, ?, ?, ?, ?)`,
          [req.studentId, phone, email, emergency_contact, address]
        );
        // Note: We don't need to include last_updated since it has a DEFAULT value
      }
      
      res.status(200).json({
        success: true,
        message: "Profile updated successfully."
      });
    } catch (error) {
      console.error("Error updating student profile:", error);
      res.status(500).json({
        success: false,
        message: "Error updating student profile: " + error.message
      });
    }
});
// Get student details
router.get('/details/:studentId', async (req, res) => {
    const { studentId } = req.params;
    
    try {
        const [details] = await db.query(
            `SELECT phone, email, emergency_contact, address
             FROM student_details 
             WHERE student_id = ?`, 
            [studentId]
        );
        
        res.status(200).json(details.length > 0 ? details[0] : {
            phone: "",
            email: "",
            emergency_contact: "",
            address: ""
        });
    } catch (error) {
        console.error("Error fetching student details:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching student details." 
        });
    }
});

export default router;