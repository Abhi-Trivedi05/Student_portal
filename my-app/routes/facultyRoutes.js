import express from 'express';
import Student from '../models/Student.js';
import SemesterRegistration from '../models/SemesterRegistration.js';
import AcademicYear from '../models/AcademicYear.js';
import FeeTransaction from '../models/FeeTransaction.js';
import CourseSelection from '../models/CourseSelection.js';
import Course from '../models/Course.js';
import FacultyRegistrationApproval from '../models/FacultyRegistrationApproval.js';
import SemesterCourseOffering from '../models/SemesterCourseOffering.js';

const router = express.Router();
// Get all applications for a faculty advisor
router.get('/:facultyId/applications', async (req, res) => {
  const { facultyId } = req.params;
  
  try {
    // Get current academic year
    const academicYear = await AcademicYear.findOne({ is_current: true });
    if (!academicYear) {
      return res.status(404).json({ message: 'Current academic year not found' });
    }
    const academicYearId = academicYear._id;

    // Find students registered under this faculty advisor
    const students = await Student.find({ faculty_advisor_id: facultyId });
    const studentIds = students.map(s => s.student_id);

    // Get registrations for these students in the current academic year
    const semesterRegistrations = await SemesterRegistration.find({
        student_id: { $in: studentIds },
        academic_year_id: academicYearId
    });

    const applications = [];

    for (const sr of semesterRegistrations) {
        const student = students.find(s => s.student_id === sr.student_id);
        
        // Fee status check
        const feeTransaction = await FeeTransaction.findOne({
            student_id: sr.student_id,
            academic_year_id: academicYearId
        });

        // Get selected courses
        const selections = await CourseSelection.find({
            student_id: sr.student_id,
            academic_year_id: academicYearId
        }).populate('course_id');

        applications.push({
            id: sr._id,
            name: student.name,
            student_id: sr.student_id,
            registrationId: `REG${new Date(sr.registration_date).getFullYear()}${sr._id.toString().slice(-4)}`,
            course: student.programme,
            batch: student.batch,
            feeStatus: (feeTransaction && feeTransaction.status === 'Paid') ? 'Approved' : 'Pending',
            applicationDate: sr.registration_date.toISOString().split('T')[0],
            status: sr.status,
            selectedCourses: selections.map(sel => ({
                course_code: sel.course_id ? sel.course_id.course_code : 'N/A',
                course_name: sel.course_id ? sel.course_id.course_name : 'N/A',
                credits: sel.course_id ? sel.course_id.credits : 0
            }))
        });
    }

    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update application status (approve or reject)
router.put('/applications/:applicationId', async (req, res) => {
  const { applicationId } = req.params;
  const { status, facultyId } = req.body;
  
  if (!['Completed', 'Failed'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  
  try {
    const sr = await SemesterRegistration.findById(applicationId);
    
    if (!sr) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    // Fee status check
    const feeTransaction = await FeeTransaction.findOne({
      student_id: sr.student_id,
      academic_year_id: sr.academic_year_id
    });
    const feeStatus = (feeTransaction && feeTransaction.status === 'Paid') ? 'Approved' : 'Pending';
    
    // If approving and fee is not paid, return error
    if (status === 'Completed' && feeStatus !== 'Approved') {
      return res.status(400).json({ message: 'Cannot approve registration when fee status is pending' });
    }
    
    // Update application status in semester_registrations
    sr.status = status;
    await sr.save();
    
    const approvalStatus = status === 'Completed' ? 'Approved' : 'Rejected';
    
    // Update or Create FacultyRegistrationApproval
    await FacultyRegistrationApproval.findOneAndUpdate(
        { 
            student_id: sr.student_id, 
            semester: sr.semester, 
            academic_year_id: sr.academic_year_id 
        },
        { 
            faculty_id: facultyId,
            status: approvalStatus,
            approval_date: new Date()
        },
        { upsert: true, new: true }
    );
    
    // Update course selection status based on approval status
    if (approvalStatus === 'Approved') {
        await CourseSelection.updateMany(
            { 
                student_id: sr.student_id, 
                semester: sr.semester, 
                academic_year_id: sr.academic_year_id,
                status: 'Pending'
            },
            { status: 'Completed' }
        );
        
        // Update available seats
        const selections = await CourseSelection.find({
            student_id: sr.student_id,
            semester: sr.semester,
            academic_year_id: sr.academic_year_id,
            status: 'Completed'
        });

        for (const sel of selections) {
            await SemesterCourseOffering.findOneAndUpdate(
                { 
                    course_id: sel.course_id, 
                    semester: sr.semester, 
                    academic_year_id: sr.academic_year_id,
                    available_seats: { $gt: 0 }
                },
                { $inc: { available_seats: -1 } }
            );
        }
    } else {
        // Rejected
        await CourseSelection.updateMany(
            { 
                student_id: sr.student_id, 
                semester: sr.semester, 
                academic_year_id: sr.academic_year_id,
                status: 'Pending'
            },
            { status: 'Dropped' }
        );
    }
    
    res.json({ message: 'Application status updated successfully' });
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get application statistics
router.get('/:facultyId/application-stats', async (req, res) => {
  const { facultyId } = req.params;
  
  try {
    const academicYear = await AcademicYear.findOne({ is_current: true });
    if (!academicYear) {
      return res.status(404).json({ message: 'Current academic year not found' });
    }
    const academicYearId = academicYear._id;

    const students = await Student.find({ faculty_advisor_id: facultyId });
    const studentIds = students.map(s => s.student_id);

    const stats = await SemesterRegistration.aggregate([
      { 
        $match: { 
          student_id: { $in: studentIds }, 
          academic_year_id: academicYearId 
        } 
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ["$status", "In Progress"] }, 1, 0] } },
          approved: { $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ["$status", "Failed"] }, 1, 0] } }
        }
      }
    ]);

    res.json(stats[0] || { total: 0, pending: 0, approved: 0, rejected: 0 });
  } catch (error) {
    console.error('Error fetching application stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get fee status summary
router.get('/:facultyId/fee-status', async (req, res) => {
  const { facultyId } = req.params;
  
  try {
    // Get current academic year
    const academicYear = await AcademicYear.findOne({ is_current: true });
    if (!academicYear) {
      return res.status(404).json({ message: 'Current academic year not found' });
    }
    const academicYearId = academicYear._id;

    // Get students under this advisor
    const students = await Student.find({ faculty_advisor_id: facultyId });
    const studentIds = students.map(s => s.student_id);

    // Get fee transactions
    const feeTransactions = await FeeTransaction.find({ 
        student_id: { $in: studentIds },
        academic_year_id: academicYearId
    });

    const stats = {
        total_students: studentIds.length,
        paid: feeTransactions.filter(ft => ft.status === 'Paid').length,
        pending: feeTransactions.filter(ft => ft.status === 'Pending').length,
        total_collected: feeTransactions.reduce((sum, ft) => sum + (ft.status === 'Paid' ? ft.amount : 0), 0)
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching fee status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get course registrations
router.get('/:facultyId/course-registrations', async (req, res) => {
  const { facultyId } = req.params;
  
  try {
    // Get current academic year
    const academicYear = await AcademicYear.findOne({ is_current: true });
    if (!academicYear) {
      return res.status(404).json({ message: 'Current academic year not found' });
    }
    const academicYearId = academicYear._id;

    // Find offerings by this faculty member
    const offerings = await SemesterCourseOffering.find({
        faculty_id: facultyId,
        academic_year_id: academicYearId
    }).populate('course_id');

    const courseRegs = [];

    for (const off of offerings) {
        // Count student selections for this offering
        const regCount = await CourseSelection.countDocuments({
            offering_id: off._id,
            status: 'Completed'
        });

        courseRegs.push({
            course_code: off.course_id ? off.course_id.course_code : 'N/A',
            course_name: off.course_id ? off.course_id.course_name : 'N/A',
            credits: off.course_id ? off.course_id.credits : 0,
            registered_students: regCount,
            max_seats: off.total_seats,
            available_seats: off.available_seats
        });
    }

    res.json(courseRegs);
  } catch (error) {
    console.error('Error fetching course registrations:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;