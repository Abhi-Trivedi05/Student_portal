import express from 'express';
import Faculty from '../models/Faculty.js';
import Student from '../models/Student.js';
import Course from '../models/Course.js';
import AcademicYear from '../models/AcademicYear.js';
import SemesterCourseOffering from '../models/SemesterCourseOffering.js';
import CourseSelection from '../models/CourseSelection.js';
import FeeTransaction from '../models/FeeTransaction.js';
import FeeApproval from '../models/FeeApproval.js';
import Backlog from '../models/Backlog.js';

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
        await Faculty.create({
            name,
            department,
            qualifications,
            email,
            phone_number,
            password,
            status: 'Active'
        });
        
        res.json({ success: true, message: "Faculty added successfully!" });
    } catch (error) {
        console.error("Error adding faculty:", error);
        
        // Handle duplicate email or phone error
        if (error.code === 11000) {
            return res.status(400).json({ 
                success: false, 
                message: "Email or phone number already exists." 
            });
        }
        
        res.status(500).json({ success: false, message: "Error adding faculty: " + error.message });
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
        // Check if the batch exists in AcademicYear table
        let academicYear = await AcademicYear.findOne({ year_name: batch });
        
        // If batch doesn't exist, add it
        if (!academicYear) {
            const batchParts = batch.split('-');
            const startYear = parseInt(batchParts[0]);
            const endYear = parseInt(batchParts[1]) || (startYear + 4);
            
            academicYear = await AcademicYear.create({
                year_name: batch,
                start_date: new Date(`${startYear}-07-01`),
                end_date: new Date(`${endYear}-06-30`),
                is_current: true
            });
            console.log(`Created new academic year entry for batch: ${batch}`);
        }
        
        // Insert student data
        await Student.create({
            student_id,
            name,
            programme,
            department,
            cpi,
            current_semester,
            batch,
            faculty_advisor_id,
            password,
            status: 'Active'
        });
        
        res.json({ success: true, message: "Student added successfully!" });
    } catch (error) {
        console.error("Error adding student:", error);
        
        if (error.code === 11000) {
            return res.status(400).json({ 
                success: false, 
                message: "Student ID already exists." 
            });
        }
        
        res.status(500).json({ success: false, message: "Error adding student: " + error.message });
    }
});
// Add Course Route (Admin only)
router.post('/add-course', verifyAdmin, async (req, res) => {
    const { 
        course_code, 
        course_name, 
        credits, 
        department, 
        faculty_id, 
        semester, 
        batch, 
        max_seats = 60,
        academic_year_id 
    } = req.body;
    
    // Validate required fields
    if (!course_code || !course_name || !credits || !department) {
        return res.status(400).json({ 
            success: false, 
            message: "Please provide all required fields: course code, name, credits, and department." 
        });
    }
    
    // Validate faculty assignment and course offering data
    if (!faculty_id || !semester || !batch || !academic_year_id) {
        return res.status(400).json({ 
            success: false, 
            message: "Please provide faculty ID, semester, batch, and academic year ID for course offering." 
        });
    }
    
    try {
        // 1. Create the course
        const course = await Course.create({
            course_code,
            course_name,
            credits: Number(credits),
            department,
            status: 'active'
        });
        
        // 2. Create the semester course offering
        await SemesterCourseOffering.create({
            course_id: course._id,
            semester: Number(semester),
            academic_year_id: academic_year_id,
            faculty_id: faculty_id,
            total_seats: Number(max_seats),
            available_seats: Number(max_seats)
        });
        
        res.json({ 
            success: true, 
            message: "Course added successfully and offering created for the specified semester!" 
        });
    } catch (error) {
        console.error("Error adding course:", error);
        
        if (error.code === 11000) {
            return res.status(400).json({ 
                success: false, 
                message: "Course with this code already exists." 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: "Error adding course: " + error.message
        });
    }
});

router.get('/get-courses', verifyAdmin, async (req, res) => {
    try {
        const offerings = await SemesterCourseOffering.find()
            .populate('course_id')
            .populate('academic_year_id');
        
        if (!offerings || offerings.length === 0) {
            return res.status(404).json({ success: false, message: 'No courses found.' });
        }
        
        // Map to format expected by frontend
        const courses = offerings.map(off => ({
            id: off.course_id ? off.course_id._id : null,
            course_code: off.course_id ? off.course_id.course_code : null,
            course_name: off.course_id ? off.course_id.course_name : null,
            credits: off.course_id ? off.course_id.credits : null,
            department: off.course_id ? off.course_id.department : null,
            semester: off.semester,
            offering_id: off._id,
            max_seats: off.total_seats,
            available_seats: off.available_seats,
            faculty_name: off.faculty_id // faculty_id is string name in current schemas or ObjectId
        }));
        
        res.status(200).json({ courses });
    } catch (error) {
        console.error("Error fetching courses:", error);
        res.status(500).json({ success: false, message: "Error fetching courses: " + error.message });
    }
});


// Add Fee Transaction Route
router.post('/add-fee-transaction', async (req, res) => {
    const { student_id, transaction_date, bank_name, amount, reference_number, status, semester, academic_year_id } = req.body;
    
    try {
        const feeTransaction = await FeeTransaction.create({
            student_id,
            transaction_date,
            bank_name,
            amount,
            reference_number,
            status,
            semester,
            academic_year_id
        });
        
        res.json({ success: true, message: "Fee transaction added successfully!" });
    } catch (error) {
        console.error("Error adding fee transaction:", error);
        res.status(500).json({ success: false, message: "Error adding fee transaction: " + error.message });
    }
});

// Get Fee Transactions for a Student
router.get('/get-fee-transactions/:student_id', async (req, res) => {
    const { student_id } = req.params;

    try {
        const results = await FeeTransaction.find({ student_id });
        if (!results || results.length === 0) {
            return res.status(404).json({ success: false, message: 'No fee transactions found for this student.' });
        }
        res.status(200).json({ fee_transactions: results });
    } catch (error) {
        console.error("Error fetching fee transactions:", error);
        res.status(500).json({ success: false, message: "Error fetching fee transactions: " + error.message });
    }
});

router.get('/faculty/:faculty_id', verifyAdmin, async (req, res) => {
    const { faculty_id } = req.params;
    
    try {
        const faculty = await Faculty.findOne({ $or: [{ _id: faculty_id }, { name: faculty_id }] });
        
        if (!faculty) {
            return res.status(404).json({ 
                success: false, 
                message: 'Faculty not found.' 
            });
        }
        
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
router.put('/edit-faculty/:faculty_id', verifyAdmin, async (req, res) => {
    const { faculty_id } = req.params;
    const { name, department, qualifications, email, phone_number, password, status } = req.body;
    
    try {
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (department !== undefined) updateData.department = department;
        if (qualifications !== undefined) updateData.qualifications = qualifications;
        if (email !== undefined) updateData.email = email;
        if (phone_number !== undefined) updateData.phone_number = phone_number;
        if (status !== undefined) updateData.status = status;
        if (password !== undefined && password.trim() !== '') updateData.password = password;
        
        const faculty = await Faculty.findOneAndUpdate(
            { $or: [{ _id: faculty_id }, { name: faculty_id }] },
            updateData,
            { new: true }
        );
        
        if (!faculty) {
            return res.status(404).json({ 
                success: false, 
                message: "Faculty not found" 
            });
        }
        
        res.json({ 
            success: true, 
            message: "Faculty updated successfully!" 
        });
    } catch (error) {
        console.error("Error updating faculty:", error);
        if (error.code === 11000) {
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
router.get('/course/:course_id', verifyAdmin, async (req, res) => {
    const { course_id } = req.params;
    
    try {
        const offering = await SemesterCourseOffering.findById(course_id)
            .populate('course_id')
            .populate('faculty_id'); // If faculty_id is ObjectId
            
        if (!offering) {
            // Try finding by course_id in offerings
            const altOffering = await SemesterCourseOffering.findOne({ course_id: course_id })
                .populate('course_id');
            
            if (!altOffering) {
                return res.status(404).json({ success: false, message: 'Course offering not found.' });
            }
            return res.status(200).json(altOffering);
        }
        
        res.status(200).json(offering);
    } catch (error) {
        console.error("Error fetching course:", error);
        res.status(500).json({ success: false, message: "Error fetching course: " + error.message });
    }
});

// Updated Edit Student Route (Admin only)
router.put('/edit-student/:student_id', verifyAdmin, async (req, res) => {
    const { student_id } = req.params;
    const { name, programme, roll_number, department, current_semester, batch, cpi, faculty_advisor_id, password, status } = req.body;
    
    try {
        // Check if the batch exists in academic_years table
        if (batch !== undefined) {
            let academicYear = await AcademicYear.findOne({ year_name: batch });
            if (!academicYear) {
                const batchParts = batch.split('-');
                const startYear = parseInt(batchParts[0]);
                const endYear = parseInt(batchParts[1]) || (startYear + 4);
                
                await AcademicYear.create({
                    year_name: batch,
                    start_date: new Date(`${startYear}-07-01`),
                    end_date: new Date(`${endYear}-06-30`),
                    is_current: true
                });
                console.log(`Created new academic year entry for batch: ${batch}`);
            }
        }
        
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (programme !== undefined) updateData.programme = programme;
        if (roll_number !== undefined) updateData.student_id = roll_number;
        if (department !== undefined) updateData.department = department;
        if (current_semester !== undefined) updateData.current_semester = current_semester;
        if (batch !== undefined) updateData.batch = batch;
        if (cpi !== undefined) updateData.cpi = cpi;
        if (faculty_advisor_id !== undefined) updateData.faculty_advisor_id = faculty_advisor_id;
        if (status !== undefined) updateData.status = status;
        if (password !== undefined && password.trim() !== '') updateData.password = password;
        
        const student = await Student.findOneAndUpdate(
            { student_id: student_id },
            updateData,
            { new: true }
        );
        
        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }
        
        res.json({ success: true, message: "Student updated successfully!" });
    } catch (error) {
        console.error("Error updating student:", error);
        if (error.code === 11000) {
            return res.status(400).json({ 
                success: false, 
                message: "Student ID already exists."
            });
        }
        res.status(500).json({ success: false, message: "Error updating student: " + error.message });
    }
});
// Updated endpoint to fetch a single student by ID
router.get('/student/:student_id', verifyAdmin, async (req, res) => {
    const { student_id } = req.params;
    
    try {
        const student = await Student.findOne({ student_id });
        
        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }
        
        // Return student data/format expected by frontend
        const studentData = student.toObject();
        studentData.id = student.student_id;
        studentData.roll_number = student.student_id;
        studentData.semester = student.current_semester;
        
        res.status(200).json(studentData);
    } catch (error) {
        console.error("Error fetching student:", error);
        res.status(500).json({ success: false, message: "Error fetching student: " + error.message });
    }
});

// Edit Course Route (Admin only)
router.put('/edit-course/:course_id', verifyAdmin, async (req, res) => {
    const { course_id } = req.params;
    const { 
        course_code, 
        course_name, 
        credits, 
        department, 
        faculty_id, 
        semester, 
        batch,
        max_seats,
        academic_year_id
    } = req.body;
    
    try {
        // Find the offering
        let offering = await SemesterCourseOffering.findById(course_id);
        
        if (!offering) {
            // Try by course_id if not found by id
            offering = await SemesterCourseOffering.findOne({ course_id: course_id, semester: semester });
        }
        
        if (!offering) {
            return res.status(404).json({ success: false, message: "Course offering not found" });
        }
        
        // Update Course details if provided
        const courseUpdateData = {};
        if (course_code !== undefined) courseUpdateData.course_code = course_code;
        if (course_name !== undefined) courseUpdateData.course_name = course_name;
        if (credits !== undefined) courseUpdateData.credits = Number(credits);
        if (department !== undefined) courseUpdateData.department = department;
        
        if (Object.keys(courseUpdateData).length > 0) {
            await Course.findByIdAndUpdate(offering.course_id, courseUpdateData);
        }
        
        // Update Offering details
        if (faculty_id !== undefined) offering.faculty_id = faculty_id;
        if (semester !== undefined) offering.semester = Number(semester);
        if (academic_year_id !== undefined) offering.academic_year_id = academic_year_id;
        
        if (max_seats !== undefined) {
            const currentMax = offering.total_seats;
            const currentAvailable = offering.available_seats;
            offering.total_seats = Number(max_seats);
            
            if (Number(max_seats) > currentMax) {
                offering.available_seats = currentAvailable + (Number(max_seats) - currentMax);
            } else {
                offering.available_seats = Math.max(0, currentAvailable - (currentMax - Number(max_seats)));
            }
        }
        
        await offering.save();
        
        res.json({ success: true, message: "Course updated successfully!" });
    } catch (error) {
        console.error("Error updating course:", error);
        res.status(500).json({ success: false, message: "Error updating course: " + error.message });
    }
});

// Remove Student Route (Admin only)
router.delete('/remove-student/:student_id', verifyAdmin, async (req, res) => {
    const { student_id } = req.params;

    try {
        const result = await Student.findOneAndDelete({ student_id: student_id });
        if (!result) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }
        res.json({ success: true, message: "Student removed successfully!" });
    } catch (error) {
        console.error("Error removing student:", error);
        res.status(500).json({ success: false, message: "Error removing student: " + error.message });
    }
});

// Remove Faculty Route (Admin only)
router.delete('/remove-faculty/:faculty_id', verifyAdmin, async (req, res) => {
    const { faculty_id } = req.params;
    
    try {
        const faculty = await Faculty.findOneAndDelete({ $or: [{ _id: faculty_id }, { name: faculty_id }] });
        
        if (!faculty) {
            return res.status(404).json({ 
                success: false, 
                message: "Faculty not found" 
            });
        }
        
        // Remove from course offerings as well
        await SemesterCourseOffering.updateMany({ faculty_id: faculty.name }, { $set: { faculty_id: 'To be assigned' } });
        
        res.json({ 
            success: true, 
            message: `Faculty '${faculty.name}' removed successfully!` 
        });
    } catch (error) {
        console.error("Error removing faculty:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error removing faculty: " + error.message 
        });
    }
});

router.delete('/remove-course/:course_id', verifyAdmin, async (req, res) => {
    const { course_id } = req.params;
    
    try {
        // Remove the course offering
        const offering = await SemesterCourseOffering.findByIdAndDelete(course_id);
        
        if (!offering) {
            // Try removing the course itself if it's a course id
            const course = await Course.findByIdAndDelete(course_id);
            if (!course) {
                return res.status(404).json({ success: false, message: "Course or offering not found" });
            }
            
            // Cleanup offerings and selections for this course
            await SemesterCourseOffering.deleteMany({ course_id: course_id });
            await CourseSelection.deleteMany({ course_id: course_id });
            
            return res.json({ success: true, message: `Course "${course.course_name}" removed successfully!` });
        }
        
        // If it was an offering, we might want to keep the course but remove selections for this offering
        await CourseSelection.deleteMany({ offering_id: course_id });
        
        res.json({ 
            success: true, 
            message: `Course offering removed successfully!`
        });
    } catch (error) {
        console.error("Error removing course:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error removing course: " + error.message
        });
    }
});
// Get Faculty Route (Admin only)
router.get('/get-faculty', verifyAdmin, async (req, res) => {
    try {
        const results = await Faculty.find();
        
        if (!results || results.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'No faculty found.' 
            });
        }
        
        res.status(200).json({ 
            success: true, 
            faculty: results 
        });
    } catch (error) {
        console.error("Error fetching faculty:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching faculty: " + error.message 
        });
    }
});

router.get('/get-course', async (req, res) => {
    try {
        const results = await Course.find();
        if (!results || results.length === 0) {
            return res.status(404).json({ success: false, message: 'No course found.' });
        }
        res.status(200).json({ course: results });
    } catch (error) {
        console.error("Error fetching course:", error);
        res.status(500).json({ success: false, message: "Error fetching course: " + error.message });
    }
});

// Get Students Route (Admin only)
router.get('/get-students', verifyAdmin, async (req, res) => {
    try {
        const results = await Student.find();
        if (!results || results.length === 0) {
            return res.status(404).json({ success: false, message: 'No students found.' });
        }
        res.status(200).json({ students: results });
    } catch (error) {
        console.error("Error fetching students:", error);
        res.status(500).json({ success: false, message: "Error fetching students." });
    }
});

router.get('/academic-years', verifyAdmin, async (req, res) => {     
    try {
        const academicYears = await AcademicYear.find().sort({ start_date: -1 });         
        
        res.json({             
            success: true, 
            data: academicYears         
        });
    } catch (error) {
        console.error("Error fetching academic years:", error);         
        res.status(500).json({ 
            success: false, 
            message: "Error fetching academic years: " + error.message         
        });
    }
});



export default router;