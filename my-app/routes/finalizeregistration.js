import express from 'express';
import FeeTransaction from '../models/FeeTransaction.js';
import Student from '../models/Student.js';
import AcademicYear from '../models/AcademicYear.js';
import FeeApproval from '../models/FeeApproval.js';
import FacultyRegistrationApproval from '../models/FacultyRegistrationApproval.js';
import SemesterRegistration from '../models/SemesterRegistration.js';
import CourseSelection from '../models/CourseSelection.js';
import SemesterCourseOffering from '../models/SemesterCourseOffering.js';
import Notification from '../models/Notification.js';

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
        const pendingFees = await FeeTransaction.find({ status: 'Pending' })
            .populate('academic_year_id', 'year_name')
            .sort({ submission_date: 1 });
        
        const formattedFees = [];
        for (const ft of pendingFees) {
            const student = await Student.findOne({ student_id: ft.student_id });
            formattedFees.push({
                id: ft._id,
                student_id: ft.student_id,
                student_name: student ? student.name : 'Unknown',
                transaction_date: ft.transaction_date,
                bank_name: ft.bank_name,
                amount: ft.amount,
                reference_number: ft.reference_number,
                semester: ft.semester,
                submission_date: ft.submission_date,
                academic_year: ft.academic_year_id ? ft.academic_year_id.year_name : 'Unknown'
            });
        }
        
        res.status(200).json({ 
            success: true,
            pendingFees: formattedFees
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
        const ft = await FeeTransaction.findById(feeTransactionId);
        if (!ft) {
            return res.status(404).json({ success: false, message: "Transaction not found" });
        }

        // Update fee transaction status
        ft.status = (status === 'Approved' ? 'Paid' : 'Rejected'); // The original code said 'Pending' for rejection, but 'Rejected' makes more sense if we have that status. Let's see. Original: [status === 'Approved' ? 'Paid' : 'Pending', feeTransactionId]
        // Wait, looking at the previous routes (feeapprovalRoutes.js), it sets it to 'Rejected'.
        // I'll stick to 'Paid' and 'Rejected' to be consistent with my other migrations.
        await ft.save();
        
        // Create fee approval record
        await FeeApproval.create({
            fee_transaction_id: feeTransactionId,
            admin_id: req.adminId,
            status: status,
            remarks: remarks || null,
            approval_date: new Date()
        });
        
        // Get transaction details to update student's registration if approved
        if (status === 'Approved') {
            // Check if faculty approval is already in place
            const facultyApproval = await FacultyRegistrationApproval.findOne({
                student_id: ft.student_id,
                semester: ft.semester,
                academic_year_id: ft.academic_year_id
            });
            
            // If faculty has also approved, update course status
            if (facultyApproval && facultyApproval.status === 'Approved') {
                await finalizeRegistration(ft.student_id, ft.semester, ft.academic_year_id);
            }
        }
        
        res.status(200).json({
            success: true,
            message: `Fee transaction has been ${status.toLowerCase()}.`
        });
    } catch (error) {
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
        const facultyStudents = await Student.find({
            faculty_advisor_id: req.facultyId,
            status: 'active'
        }).select('student_id');
        
        if (!facultyStudents || facultyStudents.length === 0) {
            return res.status(200).json({ pendingRegistrations: [] });
        }
        
        // Get list of student IDs
        const studentIds = facultyStudents.map(student => student.student_id);
        
        // Get pending registrations for these students
        const pendingRegistrations = await SemesterRegistration.find({
            student_id: { $in: studentIds },
            status: 'Completed'
        }).populate('academic_year_id', 'year_name');

        const result = [];

        for (const sr of pendingRegistrations) {
            // Check if already processed
            const alreadyProcessed = await FacultyRegistrationApproval.findOne({
                student_id: sr.student_id,
                semester: sr.semester,
                academic_year_id: sr.academic_year_id,
                status: { $in: ['Approved', 'Rejected'] }
            });

            if (alreadyProcessed) continue;

            const student = await Student.findOne({ student_id: sr.student_id });
            
            const courseCount = await CourseSelection.countDocuments({
                student_id: sr.student_id,
                semester: sr.semester,
                academic_year_id: sr.academic_year_id,
                status: 'Registered'
            });

            const feeStatusFT = await FeeTransaction.findOne({
                student_id: sr.student_id,
                semester: sr.semester,
                academic_year_id: sr.academic_year_id,
                status: 'Paid'
            });

            result.push({
                id: sr._id,
                student_id: sr.student_id,
                student_name: student ? student.name : 'Unknown',
                semester: sr.semester,
                academic_year: sr.academic_year_id ? sr.academic_year_id.year_name : 'Unknown',
                registration_date: sr.registration_date,
                course_count: courseCount,
                fee_status: feeStatusFT ? 'Paid' : 'Pending',
                approval_status: 'Pending'
            });
        }
        
        res.status(200).json({ 
            success: true,
            pendingRegistrations: result
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
        // Check if this faculty is the advisor for this student
        const student = await Student.findOne({ student_id: studentId });
        
        if (!student || student.faculty_advisor_id != req.facultyId) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to approve/reject this student's registration."
            });
        }
        
        // Check if approval record already exists
        const existingApproval = await FacultyRegistrationApproval.findOne({
            student_id: studentId,
            semester: semester,
            academic_year_id: academicYearId
        });
        
        if (existingApproval) {
            // Update existing approval
            existingApproval.status = status;
            existingApproval.remarks = remarks || null;
            existingApproval.approval_date = new Date();
            existingApproval.faculty_id = req.facultyId;
            await existingApproval.save();
        } else {
            // Create new approval record
            await FacultyRegistrationApproval.create({
                student_id: studentId,
                semester: semester,
                academic_year_id: academicYearId,
                faculty_id: req.facultyId,
                status: status,
                remarks: remarks || null,
                approval_date: new Date()
            });
        }
        
        // If approved, check if fee is also approved to finalize registration
        if (status === 'Approved') {
            // Check fee payment status
            const feeStatusFT = await FeeTransaction.findOne({
                student_id: studentId,
                semester: semester,
                academic_year_id: academicYearId,
                status: 'Paid'
            });
            
            if (feeStatusFT) {
                // Both fee and faculty approvals are in place, finalize registration
                await finalizeRegistration(studentId, semester, academicYearId);
            }
        } else if (status === 'Rejected') {
            // Update course selections status to 'Dropped' if rejected
            await CourseSelection.updateMany(
                { student_id: studentId, semester, academic_year_id: academicYearId, status: 'Pending' },
                { status: 'Dropped' }
            );
            
            // Update semester registration status
            await SemesterRegistration.findOneAndUpdate(
                { student_id: studentId, semester, academic_year_id: academicYearId },
                { status: 'Failed' }
            );
            
            // Create notification for student
            await Notification.create({
                student_id: studentId,
                message: `Your course registration for semester ${semester} has been rejected by your faculty advisor. Reason: ${remarks || 'No reason provided'}`,
                type: 'registration',
                is_read: false,
                created_at: new Date()
            });
        }
        
        res.status(200).json({
            success: true,
            message: `Registration has been ${status.toLowerCase()}.`
        });
    } catch (error) {
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
    const feeApproval = await FeeTransaction.findOne({
        student_id: studentId,
        semester: semester,
        academic_year_id: academicYearId,
        status: 'Paid'
    });
    
    const facultyApproval = await FacultyRegistrationApproval.findOne({
        student_id: studentId,
        semester: semester,
        academic_year_id: academicYearId,
        status: 'Approved'
    });
    
    // Only proceed if both approvals exist
    if (!feeApproval || !facultyApproval) {
        console.log("Cannot finalize registration: Missing required approvals");
        return false;
    }
    
    try {
        // Get all courses selected by the student that are in 'Pending' status
        const selectedCourses = await CourseSelection.find({
            student_id: studentId,
            semester: semester,
            academic_year_id: academicYearId,
            status: 'Pending'
        });
        
        // Update course selections status from 'Pending' to 'Completed'
        await CourseSelection.updateMany(
            { student_id: studentId, semester, academic_year_id: academicYearId, status: 'Pending' },
            { status: 'Completed' }
        );
        
        // Update semester registration status
        await SemesterRegistration.findOneAndUpdate(
            { student_id: studentId, semester, academic_year_id: academicYearId },
            { status: 'Completed' }
        );
        
        // Create notification for student
        await Notification.create({
            student_id: studentId,
            message: `Your course registration for semester ${semester} has been fully approved and finalized.`,
            type: 'registration',
            is_read: false,
            created_at: new Date()
        });
        
        // For each course, decrement the available seats
        for (const course of selectedCourses) {
            await SemesterCourseOffering.findOneAndUpdate(
                { 
                    course_id: course.course_id, 
                    semester: semester, 
                    academic_year_id: academicYearId, 
                    available_seats: { $gt: 0 } 
                },
                { $inc: { available_seats: -1 } }
            );
        }
        
        return true;
    } catch (error) {
        console.error("Error finalizing registration:", error);
        return false;
    }
}

// Export the router
export default router;