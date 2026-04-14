import express from 'express';
import Student from '../models/Student.js';
import AcademicYear from '../models/AcademicYear.js';
import CourseSelection from '../models/CourseSelection.js';
import SemesterCourseOffering from '../models/SemesterCourseOffering.js';
import Course from '../models/Course.js';
import Faculty from '../models/Faculty.js';
import SemesterRegistration from '../models/SemesterRegistration.js';
import FacultyRegistrationApproval from '../models/FacultyRegistrationApproval.js';
import FeeTransaction from '../models/FeeTransaction.js';
import FeeApproval from '../models/FeeApproval.js';

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
        const student = await Student.findOne({ student_id: studentId, status: 'active' })
            .select('student_id name programme department cpi current_semester batch faculty_advisor_id');
        
        if (!student) {
            return res.status(404).json({ 
                success: false, 
                message: "Student not found or account is inactive." 
            });
        }
        
        res.status(200).json(student);
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
    
    try {
        // First, get the current academic year
        const academicYear = await AcademicYear.findOne({ is_current: true });
        
        if (!academicYear) {
            return res.status(404).json({ 
                success: false, 
                message: "Current academic year not found." 
            });
        }
        
        // Get student's current semester
        const student = await Student.findOne({ student_id: studentId }).select('current_semester');
        
        if (!student) {
            return res.status(404).json({ 
                success: false, 
                message: "Student not found." 
            });
        }
        
        const currentSemester = student.current_semester;
        
        // Get the courses for the student in the current semester and academic year
        // We find course selections, populate course details, and populate offering/faculty.
        const selections = await CourseSelection.find({
            student_id: studentId,
            status: { $ne: 'Dropped' }
            // Note: If semester/academic_year are in CourseSelection schema, we'd filter here.
            // As currently defined, we just filter by student and rely on offering.
        }).populate({
            path: 'offering_id',
            match: { academic_year_id: academicYear._id },
            populate: [
                { path: 'course_id' },
                { path: 'faculty_id' } // Note: faculty_id is a string in schema right now.
            ]
        });
        
        // Map to expected format
        const courses = selections
            .filter(sel => sel.offering_id && sel.offering_id.course_id && sel.offering_id.course_id.status !== 'inactive')
            .map(sel => ({
                id: sel.offering_id.course_id._id,
                course_code: sel.offering_id.course_id.course_code,
                course_name: sel.offering_id.course_id.course_name,
                credits: sel.offering_id.course_id.credits,
                department: sel.offering_id.course_id.department,
                grade: sel.grade || null,
                status: sel.status,
                faculty_name: sel.offering_id.faculty_id // Should ideally be populated if we linked to Faculty objectId
            }));
        
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
router.get('/registration/available-courses', verifyStudent, async (req, res) => {
    try {
        console.log("Fetching courses for student ID:", req.studentId);
        
        // Get student's current semester
        const student = await Student.findOne({ student_id: req.studentId }).select('current_semester programme department');
        
        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found." });
        }
        
        const { current_semester, department } = student;
        
        // Get current academic year
        const academicYear = await AcademicYear.findOne({ is_current: true });
        
        if (!academicYear) {
            return res.status(404).json({ success: false, message: "Current academic year not found." });
        }
        
        const academicYearId = academicYear._id;
        
        // Find offerings for this semester and year, populating course and faculty info
        const offerings = await SemesterCourseOffering.find({
            semester: current_semester,
            academic_year_id: academicYearId
        }).populate('course_id').populate('faculty_id'); // faculty_id is currently a string in schema

        // Get student's course selections for this semester/year to check registration status
        const selections = await CourseSelection.find({
            student_id: req.studentId
            // status check added in map
        }).populate('offering_id');
        
        // Map to the format expected by the frontend
        const courses = offerings
            .filter(off => off.course_id && off.course_id.status !== 'inactive')
            .map(off => {
                const selection = selections.find(sel => sel.offering_id && sel.offering_id._id.toString() === off._id.toString());
                return {
                    id: off.course_id._id,
                    course_code: off.course_id.course_code,
                    course_name: off.course_id.course_name,
                    credits: off.course_id.credits,
                    department: off.course_id.department,
                    offering_id: off._id,
                    max_seats: off.total_seats,
                    available_seats: off.available_seats,
                    faculty_name: off.faculty_id, // If faculty_id is a string (id), this is it
                    already_registered: selection ? selection.status === 'Registered' : false,
                    selection_status: selection ? selection.status : null
                };
            });
        
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
        // Get course offering details
        const offering = await SemesterCourseOffering.findById(offeringId);
        
        if (!offering) {
            return res.status(404).json({
                success: false,
                message: "Course offering not found."
            });
        }
        
        // Check if student already selected this course
        const existingSelection = await CourseSelection.findOne({
            student_id: req.studentId,
            offering_id: offeringId
        });
        
        // If already registered, don't change anything
        if (existingSelection) {
            if (existingSelection.status === 'Registered') {
                return res.status(400).json({
                    success: false,
                    message: "You are already registered for this course."
                });
            } else {
                // If already pending, don't need to do anything
                return res.json({
                    success: true,
                    message: "Course already selected."
                });
            }
        }
        
        // Register the student for the course with Pending status
        await CourseSelection.create({
            student_id: req.studentId,
            offering_id: offeringId,
            status: 'Pending'
        });
        
        // Check if semester registration exists for this student
        const semesterReg = await SemesterRegistration.findOne({
            student_id: req.studentId,
            semester: offering.semester,
            academic_year_id: offering.academic_year_id
        });
        
        // If no semester registration exists, create one
        if (!semesterReg) {
            await SemesterRegistration.create({
                student_id: req.studentId,
                semester: offering.semester,
                academic_year_id: offering.academic_year_id,
                status: 'In Progress'
            });
        }
        
        res.json({
            success: true,
            message: "Course selected successfully."
        });
    } catch (error) {
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
        // Find the offering to check deadline
        const offering = await SemesterCourseOffering.findOne({
            course_id: courseId,
            semester: semester,
            academic_year_id: academicYearId
        });
        
        if (offering) {
            // If deadline has passed, don't allow dropping
            if (offering.registration_deadline && new Date(offering.registration_deadline) < new Date()) {
                return res.status(400).json({
                    success: false,
                    message: "Course drop deadline has passed."
                });
            }
            
            // Update course selection status to 'Dropped'
            const updateResult = await CourseSelection.findOneAndUpdate(
                {
                    student_id: req.studentId,
                    offering_id: offering._id,
                    status: { $ne: 'Dropped' }
                },
                { status: 'Dropped' }
            );
            
            if (!updateResult) {
                return res.status(404).json({
                    success: false,
                    message: "Course selection not found or already dropped."
                });
            }
            
            // Increase available seats
            await SemesterCourseOffering.findByIdAndUpdate(offering._id, {
                $inc: { available_seats: 1 }
            });
        } else {
            return res.status(404).json({
                success: false,
                message: "Course offering not found."
            });
        }
        
        res.json({
            success: true,
            message: "Successfully dropped the course."
        });
    } catch (error) {
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
        const academicYear = await AcademicYear.findOne({ is_current: true });
        
        if (!academicYear) {
            return res.status(404).json({ 
                success: false, 
                message: "Current academic year not found." 
            });
        }
        
        const academicYearId = academicYear._id;
        
        // Get student's fee transactions
        const transactions = await FeeTransaction.find({ student_id: studentId }).sort({ transaction_date: -1 });
        
        // Get student's current semester
        const student = await Student.findOne({ student_id: studentId }).select('current_semester');
        
        if (!student) {
            return res.status(404).json({ 
                success: false, 
                message: "Student not found." 
            });
        }
        
        const currentSemester = student.current_semester;
        
        // Check if fee is paid for current semester
        const currentSemesterFee = await FeeTransaction.findOne({
            student_id: studentId,
            semester: currentSemester,
            academic_year_id: academicYearId,
            status: 'Paid'
        });
        
        const feeStatus = {
            currentSemester,
            isPaid: !!currentSemesterFee,
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
    const { transaction_date, bank_name, amount, reference_number, semester, academic_year_id } = req.body;
    
    if (!transaction_date || !bank_name || !amount || !reference_number || !semester) {
        return res.status(400).json({
            success: false,
            message: "All required fields must be provided."
        });
    }
    
    try {
        let academicYearId = academic_year_id;
        if (!academicYearId) {
            const academicYear = await AcademicYear.findOne({ is_current: true });
            if (!academicYear) {
                return res.status(404).json({
                    success: false,
                    message: "Current academic year not found."
                });
            }
            academicYearId = academicYear._id;
        }
        
        // Check if reference number is already used
        const existingRef = await FeeTransaction.findOne({ reference_number: reference_number });
        
        if (existingRef) {
            return res.status(400).json({
                success: false,
                message: "This reference number has already been used."
            });
        }
        
        // Submit fee payment (initially as pending)
        const feeTransaction = await FeeTransaction.create({
            student_id: req.studentId,
            academic_year_id: academicYearId,
            transaction_date: transaction_date,
            bank_name: bank_name,
            amount: amount,
            reference_number: reference_number,
            status: 'Pending',
            semester: semester
        });
        
        // Create fee approval record for admin to review
        await FeeApproval.create({
            fee_transaction_id: feeTransaction._id,
            status: 'Pending'
        });
        
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
        // Verify student ID matches the authenticated student
        if (student_id !== req.studentId) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized student ID."
            });
        }
        
        // Update student's CPI if provided
        if (cpi !== undefined && cpi !== null) {
            await Student.findOneAndUpdate({ student_id: req.studentId }, { cpi: cpi });
        }
        
        // Update or Create semester registration
        await SemesterRegistration.findOneAndUpdate(
            {
                student_id: req.studentId,
                semester: semester,
                academic_year_id: academic_year_id
            },
            {
                status: 'In Progress',
                registration_date: new Date()
            },
            { upsert: true, new: true }
        );
        
        // Get the faculty advisor for this student
        const student = await Student.findOne({ student_id: req.studentId }).select('faculty_advisor_id');
        
        if (!student || !student.faculty_advisor_id) {
            return res.status(400).json({
                success: false,
                message: "No faculty advisor assigned to this student."
            });
        }
        
        const facultyAdvisorId = student.faculty_advisor_id;
        
        // Create or update faculty approval record
        await FacultyRegistrationApproval.findOneAndUpdate(
            {
                student_id: req.studentId,
                semester: semester,
                academic_year_id: academic_year_id
            },
            {
                status: 'Pending',
                faculty_id: facultyAdvisorId,
                approval_date: new Date()
            },
            { upsert: true, new: true }
        );
        
        res.status(200).json({
            success: true,
            message: "Semester registration submitted successfully. Waiting for faculty advisor approval."
        });
    } catch (error) {
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
        const academicYear = await AcademicYear.findOne({ is_current: true });
        
        if (!academicYear) {
            return res.status(404).json({
                success: false,
                message: "Current academic year not found."
            });
        }
        
        const academicYearId = academicYear._id;
        
        // Get student's current semester
        const student = await Student.findOne({ student_id: req.studentId }).select('current_semester');
        
        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }
        
        const currentSemester = student.current_semester;
        
        // Get registration status
        const registration = await SemesterRegistration.findOne({
            student_id: req.studentId,
            semester: currentSemester,
            academic_year_id: academicYearId
        });

        const facultyApproval = await FacultyRegistrationApproval.findOne({
            student_id: req.studentId,
            semester: currentSemester,
            academic_year_id: academicYearId
        });

        // Fee status check
        const feeTransaction = await FeeTransaction.findOne({
            student_id: req.studentId,
            semester: currentSemester,
            academic_year_id: academicYearId
        });

        let feeStatus = null;
        if (feeTransaction) {
            const approval = await FeeApproval.findOne({ fee_transaction_id: feeTransaction._id });
            feeStatus = approval ? approval.status : 'Pending';
        }
        
        // Get registered courses
        const selections = await CourseSelection.find({
            student_id: req.studentId,
            status: 'Registered'
        }).populate({
            path: 'offering_id',
            match: { semester: currentSemester, academic_year_id: academicYearId },
            populate: { path: 'course_id' }
        });

        const courses = selections
            .filter(sel => sel.offering_id && sel.offering_id.course_id)
            .map(sel => ({
                id: sel.offering_id.course_id._id,
                course_code: sel.offering_id.course_id.course_code,
                course_name: sel.offering_id.course_id.course_name,
                credits: sel.offering_id.course_id.credits
            }));
        
        res.status(200).json({
            registration: registration ? {
                registration_status: registration.status,
                faculty_approval_status: facultyApproval ? facultyApproval.status : null,
                faculty_remarks: facultyApproval ? facultyApproval.remarks : null,
                fee_status: feeStatus
            } : {
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
        const academicYear = await AcademicYear.findOne({ is_current: true }).select('year_name start_date end_date');
        
        if (!academicYear) {
            return res.status(404).json({
                success: false,
                message: "Current academic year not found."
            });
        }
        
        res.status(200).json(academicYear);
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
        // Since we've flattened student_details into the Student model for MongoDB
        const student = await Student.findOneAndUpdate(
            { student_id: req.studentId },
            { 
                phone, 
                email, 
                emergency_contact, 
                address,
                last_updated: new Date()
            },
            { new: true }
        );
        
        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
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
        const student = await Student.findOne({ student_id: studentId }).select('phone email emergency_contact address');
        
        if (!student) {
            return res.status(200).json({
                phone: "",
                email: "",
                emergency_contact: "",
                address: ""
            });
        }
        
        res.status(200).json(student);
    } catch (error) {
        console.error("Error fetching student details:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching student details." 
        });
    }
});

export default router;