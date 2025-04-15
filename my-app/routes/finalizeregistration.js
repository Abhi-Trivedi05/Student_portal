import express from 'express';
import db from '../database/db.js';

const router = express.Router();

// Middleware to verify admin
const verifyAdmin = (req, res, next) => {
    const adminId = req.header('AdminId');
    
    if (!adminId) {
        return res.status(401).json({ 
            success: false, 
            message: "Admin authorization required." 
        });
    }
    
    req.adminId = adminId;
    next();
};

// Middleware to verify faculty
const verifyFaculty = (req, res, next) => {
    const facultyId = req.header('FacultyId');
    
    if (!facultyId) {
        return res.status(401).json({ 
            success: false, 
            message: "Faculty authorization required." 
        });
    }
    
    req.facultyId = facultyId;
    next();
};

// Get pending fee transactions for admin approval
router.get('/admin/pending-fee-approvals', verifyAdmin, async (req, res) => {
    try {
        const [pendingFees] = await db.query(
            `SELECT ft.id, ft.student_id, s.name as student_name, ft.transaction_date, 
                    ft.bank_name, ft.amount, ft.reference_number, ft.semester, 
                    ft.submission_date, ay.year_name as academic_year
             FROM fee_transactions ft
             JOIN students s ON ft.student_id = s.student_id
             JOIN academic_years ay ON ft.academic_year_id = ay.id
             WHERE ft.status = 'Pending'
             ORDER BY ft.submission_date ASC`
        );
        
        res.status(200).json({ 
            success: true,
            pendingFees 
        });
    } catch (error) {
        console.error("Error fetching pending fee approvals:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching pending fee approvals: " + error.message 
        });
    }
});

// Process fee approval/rejection by admin
router.post('/admin/process-fee-approval', verifyAdmin, async (req, res) => {
    const { feeTransactionId, status, remarks } = req.body;
    
    if (!feeTransactionId || !status) {
        return res.status(400).json({
            success: false,
            message: "Fee transaction ID and status are required."
        });
    }
    
    if (status !== 'Approved' && status !== 'Rejected') {
        return res.status(400).json({
            success: false,
            message: "Status must be either 'Approved' or 'Rejected'."
        });
    }
    
    try {
        // Begin transaction
        await db.query('START TRANSACTION');
        
        // Update fee transaction status
        await db.query(
            `UPDATE fee_transactions SET status = ? WHERE id = ?`,
            [status === 'Approved' ? 'Paid' : 'Pending', feeTransactionId]
        );
        
        // Create fee approval record
        await db.query(
            `INSERT INTO fee_approvals 
             (fee_transaction_id, admin_id, status, remarks) 
             VALUES (?, ?, ?, ?)`,
            [feeTransactionId, req.adminId, status, remarks || null]
        );
        
        // Get transaction details to update student's registration if approved
        if (status === 'Approved') {
            const [transactionDetails] = await db.query(
                `SELECT student_id, semester, academic_year_id 
                 FROM fee_transactions 
                 WHERE id = ?`,
                [feeTransactionId]
            );
            
            if (transactionDetails && transactionDetails.length > 0) {
                const details = transactionDetails[0];
                
                // Check if faculty approval is already in place
                const [facultyApproval] = await db.query(
                    `SELECT status FROM faculty_registration_approvals
                     WHERE student_id = ? AND semester = ? AND academic_year_id = ?`,
                    [details.student_id, details.semester, details.academic_year_id]
                );
                
                // If faculty has also approved, update course status
                if (facultyApproval && facultyApproval.length > 0 && facultyApproval[0].status === 'Approved') {
                    // This is where we would assign courses to the student
                    // But as per requirements, we don't update until both approvals are in place
                    // This logic will be in a separate function called by both approval processes
                    await finalizeRegistration(details.student_id, details.semester, details.academic_year_id);
                }
            }
        }
        
        // Commit transaction
        await db.query('COMMIT');
        
        res.status(200).json({
            success: true,
            message: `Fee transaction has been ${status.toLowerCase()}.`
        });
    } catch (error) {
        // Rollback in case of error
        await db.query('ROLLBACK');
        
        console.error("Error processing fee approval:", error);
        res.status(500).json({
            success: false,
            message: "Error processing fee approval: " + error.message
        });
    }
});

// Get pending registrations for faculty approval
router.get('/faculty/pending-approvals', verifyFaculty, async (req, res) => {
    try {
        // First get the students assigned to this faculty advisor
        const [facultyStudents] = await db.query(
            `SELECT student_id FROM students 
             WHERE faculty_advisor_id = ? AND status = 'active'`,
            [req.facultyId]
        );
        
        if (!facultyStudents || facultyStudents.length === 0) {
            return res.status(200).json({ pendingRegistrations: [] });
        }
        
        // Get list of student IDs
        const studentIds = facultyStudents.map(student => student.student_id);
        
        // Get pending registrations for these students
        const [pendingRegistrations] = await db.query(
            `SELECT sr.id, sr.student_id, s.name as student_name, sr.semester, 
                    ay.year_name as academic_year, sr.registration_date,
                    (SELECT COUNT(*) FROM course_selections 
                     WHERE student_id = sr.student_id 
                     AND semester = sr.semester 
                     AND academic_year_id = sr.academic_year_id
                     AND status = 'Registered') as course_count,
                    CASE 
                      WHEN EXISTS (
                        SELECT 1 FROM fee_transactions 
                        WHERE student_id = sr.student_id 
                        AND semester = sr.semester 
                        AND academic_year_id = sr.academic_year_id
                        AND status = 'Paid'
                      ) THEN 'Paid' 
                      ELSE 'Pending' 
                    END as fee_status,
                    CASE 
                      WHEN EXISTS (
                        SELECT 1 FROM faculty_registration_approvals 
                        WHERE student_id = sr.student_id 
                        AND semester = sr.semester 
                        AND academic_year_id = sr.academic_year_id
                      ) THEN 'Already Processed' 
                      ELSE 'Pending' 
                    END as approval_status
             FROM semester_registrations sr
             JOIN students s ON sr.student_id = s.student_id
             JOIN academic_years ay ON sr.academic_year_id = ay.id
             WHERE sr.student_id IN (?) 
             AND sr.status = 'Completed'
             AND NOT EXISTS (
                SELECT 1 FROM faculty_registration_approvals 
                WHERE student_id = sr.student_id 
                AND semester = sr.semester 
                AND academic_year_id = sr.academic_year_id
                AND status IN ('Approved', 'Rejected')
             )
             ORDER BY sr.registration_date ASC`,
            [studentIds]
        );
        
        res.status(200).json({ 
            success: true,
            pendingRegistrations 
        });
    } catch (error) {
        console.error("Error fetching pending approvals:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching pending approvals: " + error.message 
        });
    }
});

// Process registration approval/rejection by faculty
router.post('/faculty/process-registration-approval', verifyFaculty, async (req, res) => {
    const { studentId, semester, academicYearId, status, remarks } = req.body;
    
    if (!studentId || !semester || !academicYearId || !status) {
        return res.status(400).json({
            success: false,
            message: "Student ID, semester, academic year ID, and status are required."
        });
    }
    
    if (status !== 'Approved' && status !== 'Rejected') {
        return res.status(400).json({
            success: false,
            message: "Status must be either 'Approved' or 'Rejected'."
        });
    }
    
    try {
        // Begin transaction
        await db.query('START TRANSACTION');
        
        // Check if this faculty is the advisor for this student
        const [studentData] = await db.query(
            `SELECT faculty_advisor_id FROM students WHERE student_id = ?`,
            [studentId]
        );
        
        if (!studentData || studentData.length === 0 || studentData[0].faculty_advisor_id != req.facultyId) {
            await db.query('ROLLBACK');
            return res.status(403).json({
                success: false,
                message: "You are not authorized to approve/reject this student's registration."
            });
        }
        
        // Check if approval record already exists
        const [existingApproval] = await db.query(
            `SELECT id FROM faculty_registration_approvals 
             WHERE student_id = ? AND semester = ? AND academic_year_id = ?`,
            [studentId, semester, academicYearId]
        );
        
        if (existingApproval && existingApproval.length > 0) {
            // Update existing approval
            await db.query(
                `UPDATE faculty_registration_approvals 
                 SET status = ?, remarks = ?, approval_date = NOW()
                 WHERE id = ?`,
                [status, remarks || null, existingApproval[0].id]
            );
        } else {
            // Create new approval record
            await db.query(
                `INSERT INTO faculty_registration_approvals 
                 (student_id, semester, academic_year_id, faculty_id, status, remarks) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [studentId, semester, academicYearId, req.facultyId, status, remarks || null]
            );
        }
        
        // If approved, check if fee is also approved to finalize registration
        if (status === 'Approved') {
            // Check fee payment status
            const [feeStatus] = await db.query(
                `SELECT id FROM fee_transactions 
                 WHERE student_id = ? AND semester = ? AND academic_year_id = ? AND status = 'Paid'`,
                [studentId, semester, academicYearId]
            );
            
            if (feeStatus && feeStatus.length > 0) {
                // Both fee and faculty approvals are in place, finalize registration
                await finalizeRegistration(studentId, semester, academicYearId);
            }
        } else if (status === 'Rejected') {
            // Update course selections status to 'Dropped' if rejected
            await db.query(
                `UPDATE course_selections 
                 SET status = 'Dropped' 
                 WHERE student_id = ? AND semester = ? AND academic_year_id = ? AND status = 'Pending'`,
                [studentId, semester, academicYearId]
            );
            
            // Update semester registration status
            await db.query(
                `UPDATE semester_registrations 
                 SET status = 'Failed' 
                 WHERE student_id = ? AND semester = ? AND academic_year_id = ?`,
                [studentId, semester, academicYearId]
            );
            
            // Create notification for student
            await db.query(
                `INSERT INTO notifications 
                 (student_id, message, type) 
                 VALUES (?, ?, ?)`,
                [
                    studentId, 
                    `Your course registration for semester ${semester} has been rejected by your faculty advisor. Reason: ${remarks || 'No reason provided'}`, 
                    'registration'
                ]
            );
        }
        
        // Commit transaction
        await db.query('COMMIT');
        
        res.status(200).json({
            success: true,
            message: `Registration has been ${status.toLowerCase()}.`
        });
    } catch (error) {
        // Rollback in case of error
        await db.query('ROLLBACK');
        
        console.error("Error processing registration approval:", error);
        res.status(500).json({
            success: false,
            message: "Error processing registration approval: " + error.message
        });
    }
});

// Helper function to finalize registration when both approvals are in place
async function finalizeRegistration(studentId, semester, academicYearId) {
    // Check that both approvals are in place
    const [feeApproval] = await db.query(
        `SELECT id FROM fee_transactions 
         WHERE student_id = ? AND semester = ? AND academic_year_id = ? AND status = 'Paid'`,
        [studentId, semester, academicYearId]
    );
    
    const [facultyApproval] = await db.query(
        `SELECT id FROM faculty_registration_approvals 
         WHERE student_id = ? AND semester = ? AND academic_year_id = ? AND status = 'Approved'`,
        [studentId, semester, academicYearId]
    );
    
    // Only proceed if both approvals exist
    if (feeApproval.length === 0 || facultyApproval.length === 0) {
        console.log("Cannot finalize registration: Missing required approvals");
        return false;
    }
    
    try {
        // Begin transaction
        await db.query('START TRANSACTION');
        
        // Get all courses selected by the student that are in 'Pending' status
        const [selectedCourses] = await db.query(
            `SELECT id, course_id 
             FROM course_selections 
             WHERE student_id = ? AND semester = ? AND academic_year_id = ? AND status = 'Pending'`,
            [studentId, semester, academicYearId]
        );
        
        // Update course selections status from 'Pending' to 'Completed'
        await db.query(
            `UPDATE course_selections 
             SET status = 'Completed' 
             WHERE student_id = ? AND semester = ? AND academic_year_id = ? AND status = 'Pending'`,
            [studentId, semester, academicYearId]
        );
        
        // Update semester registration status
        await db.query(
            `UPDATE semester_registrations 
             SET status = 'Completed' 
             WHERE student_id = ? AND semester = ? AND academic_year_id = ?`,
            [studentId, semester, academicYearId]
        );
        
        // Create notification for student
        await db.query(
            `INSERT INTO notifications 
             (student_id, message, type) 
             VALUES (?, ?, ?)`,
            [
                studentId, 
                `Your course registration for semester ${semester} has been fully approved and finalized.`, 
                'registration'
            ]
        );
        
        // For each course, decrement the available seats
        for (const course of selectedCourses) {
            await db.query(
                `UPDATE semester_course_offerings 
                 SET available_seats = available_seats - 1 
                 WHERE course_id = ? AND semester = ? AND academic_year_id = ? AND available_seats > 0`,
                [course.course_id, semester, academicYearId]
            );
        }
        
        // Commit transaction
        await db.query('COMMIT');
        return true;
    } catch (error) {
        // Rollback in case of error
        await db.query('ROLLBACK');
        console.error("Error finalizing registration:", error);
        return false;
    }
}

// Export the router
export default router;