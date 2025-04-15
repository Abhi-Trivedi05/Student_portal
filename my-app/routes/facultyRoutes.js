import express from 'express';
import db from '../database/db.js';

const router = express.Router();
// Get all applications for a faculty advisor
router.get('/:facultyId/applications', async (req, res) => {
  const { facultyId } = req.params;
  
  try {
    // Get current academic year
    const [academicYears] = await db.query('SELECT id FROM academic_years WHERE is_current = TRUE');
    if (academicYears.length === 0) {
      return res.status(404).json({ message: 'Current academic year not found' });
    }
    const academicYearId = academicYears[0].id;

    // Get students registered under this faculty advisor with their registration status
    const [applications] = await db.query(`
      SELECT 
        sr.id,
        s.name,
        s.student_id,
        CONCAT('REG', YEAR(sr.registration_date), sr.id) as registrationId,
        s.programme as course,
        s.batch,
        CASE 
          WHEN ft.status = 'Paid' THEN 'Approved'
          ELSE 'Pending'
        END as feeStatus,
        DATE_FORMAT(sr.registration_date, '%Y-%m-%d') as applicationDate,
        sr.status
      FROM 
        students s
      INNER JOIN 
        semester_registrations sr ON s.student_id = sr.student_id
      LEFT JOIN
        fee_transactions ft ON s.student_id = ft.student_id AND ft.academic_year_id = ?
      WHERE 
        s.faculty_advisor_id = ? AND sr.academic_year_id = ?
    `, [academicYearId, facultyId, academicYearId]);

    // For each application, get the selected courses
    for (const app of applications) {
      const [courses] = await db.query(`
        SELECT 
          c.course_code,
          c.course_name,
          c.credits
        FROM 
          course_selections cs
        INNER JOIN 
          courses c ON cs.course_id = c.id
        WHERE 
          cs.student_id = ? AND cs.academic_year_id = ?
      `, [app.student_id, academicYearId]);
      
      app.selectedCourses = courses;
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
    // Get student and fee information
    const [application] = await db.query(`
      SELECT 
        sr.student_id,
        sr.semester,
        sr.academic_year_id,
        CASE 
          WHEN ft.status = 'Paid' THEN 'Approved'
          ELSE 'Pending'
        END as feeStatus
      FROM 
        semester_registrations sr
      LEFT JOIN
        fee_transactions ft ON sr.student_id = ft.student_id AND ft.academic_year_id = sr.academic_year_id
      WHERE 
        sr.id = ?
    `, [applicationId]);
    
    if (application.length === 0) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    // If approving and fee is not paid, return error
    if (status === 'Completed' && application[0].feeStatus !== 'Approved') {
      return res.status(400).json({ message: 'Cannot approve registration when fee status is pending' });
    }
    
    // Begin transaction
    await db.query('START TRANSACTION');
    
    // Update application status in semester_registrations
    await db.query('UPDATE semester_registrations SET status = ? WHERE id = ?', [status, applicationId]);
    
    // Map semester_registrations status to faculty_registration_approvals status
    const approvalStatus = status === 'Completed' ? 'Approved' : 'Rejected';
    const studentId = application[0].student_id;
    const semester = application[0].semester;
    const academicYearId = application[0].academic_year_id;
    
    // Check if approval record exists
    const [existingApproval] = await db.query(
      'SELECT id FROM faculty_registration_approvals WHERE student_id = ? AND semester = ? AND academic_year_id = ?',
      [studentId, semester, academicYearId]
    );
    
    if (existingApproval.length > 0) {
      // Update existing record
      await db.query(
        'UPDATE faculty_registration_approvals SET status = ?, approval_date = CURRENT_TIMESTAMP WHERE id = ?',
        [approvalStatus, existingApproval[0].id]
      );
    } else {
      // Insert new record
      await db.query(
        'INSERT INTO faculty_registration_approvals (student_id, semester, academic_year_id, faculty_id, status) VALUES (?, ?, ?, ?, ?)',
        [studentId, semester, academicYearId, facultyId, approvalStatus]
      );
    }
    
    // Update course selection status based on approval status
    if (approvalStatus === 'Approved') {
      // Update course selection status to 'Completed' regardless of fee status
      await db.query(
        'UPDATE course_selections SET status = "Completed" WHERE student_id = ? AND semester = ? AND academic_year_id = ? AND status = "Pending"',
        [studentId, semester, academicYearId]
      );
      
      // Get selected courses to update available seats
      const [selectedCourses] = await db.query(
        'SELECT course_id FROM course_selections WHERE student_id = ? AND semester = ? AND academic_year_id = ? AND status = "Completed"',
        [studentId, semester, academicYearId]
      );
      
      // Update available seats for each course
      for (const course of selectedCourses) {
        await db.query(
          'UPDATE semester_course_offerings SET available_seats = available_seats - 1 WHERE course_id = ? AND semester = ? AND academic_year_id = ? AND available_seats > 0',
          [course.course_id, semester, academicYearId]
        );
      }
    } else if (approvalStatus === 'Rejected') {
      // Update course selection status to 'Dropped'
      await db.query(
        'UPDATE course_selections SET status = "Dropped" WHERE student_id = ? AND semester = ? AND academic_year_id = ? AND status = "Pending"',
        [studentId, semester, academicYearId]
      );
      // Check if fee is also paid
      const [feeStatus] = await db.query(
        'SELECT id FROM fee_transactions WHERE student_id = ? AND semester = ? AND academic_year_id = ? AND status = "Paid"',
        [studentId, semester, academicYearId]
      );
      
      if (feeStatus.length > 0) {
        // Both approvals are in place, update course status to 'Completed'
        await db.query(
          'UPDATE course_selections SET status = "Completed" WHERE student_id = ? AND semester = ? AND academic_year_id = ? AND status = "Pending"',
          [studentId, semester, academicYearId]
        );
        
        // Get selected courses to update available seats
        const [selectedCourses] = await db.query(
          'SELECT course_id FROM course_selections WHERE student_id = ? AND semester = ? AND academic_year_id = ? AND status = "Completed"',
          [studentId, semester, academicYearId]
        );
        
        // Update available seats for each course
        for (const course of selectedCourses) {
          await db.query(
            'UPDATE semester_course_offerings SET available_seats = available_seats - 1 WHERE course_id = ? AND semester = ? AND academic_year_id = ? AND available_seats > 0',
            [course.course_id, semester, academicYearId]
          );
        }
      }
    } else if (approvalStatus === 'Rejected') {
      // Update course selection status to 'Dropped'
      await db.query(
        'UPDATE course_selections SET status = "Dropped" WHERE student_id = ? AND semester = ? AND academic_year_id = ? AND status = "Pending"',
        [studentId, semester, academicYearId]
      );
    }
    
    // Commit transaction
    await db.query('COMMIT');
    
    res.json({ message: 'Application status updated successfully' });
  } catch (error) {
    // Rollback in case of error
    await db.query('ROLLBACK');
    console.error('Error updating application:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get application statistics
router.get('/:facultyId/application-stats', async (req, res) => {
  const { facultyId } = req.params;
  
  try {
    // Get current academic year
    const [academicYears] = await db.query('SELECT id FROM academic_years WHERE is_current = TRUE');
    if (academicYears.length === 0) {
      return res.status(404).json({ message: 'Current academic year not found' });
    }
    const academicYearId = academicYears[0].id;

    // Get counts for each status
    const [stats] = await db.query(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN sr.status = 'In Progress' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN sr.status = 'Completed' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN sr.status = 'Failed' THEN 1 ELSE 0 END) as rejected
      FROM
        students s
      INNER JOIN
        semester_registrations sr ON s.student_id = sr.student_id
      WHERE
        s.faculty_advisor_id = ? AND sr.academic_year_id = ?
    `, [facultyId, academicYearId]);

    res.json(stats[0]);
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
    const [academicYears] = await db.query('SELECT id FROM academic_years WHERE is_current = TRUE');
    if (academicYears.length === 0) {
      return res.status(404).json({ message: 'Current academic year not found' });
    }
    const academicYearId = academicYears[0].id;

    // Get fee status summary
    const [feeStatus] = await db.query(`
      SELECT
        COUNT(DISTINCT s.student_id) as total_students,
        SUM(CASE WHEN ft.status = 'Paid' THEN 1 ELSE 0 END) as paid,
        SUM(CASE WHEN ft.status = 'Pending' THEN 1 ELSE 0 END) as pending,
        SUM(ft.amount) as total_collected
      FROM
        students s
      LEFT JOIN
        fee_transactions ft ON s.student_id = ft.student_id AND ft.academic_year_id = ?
      WHERE
        s.faculty_advisor_id = ?
    `, [academicYearId, facultyId]);

    res.json(feeStatus[0]);
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
    const [academicYears] = await db.query('SELECT id FROM academic_years WHERE is_current = TRUE');
    if (academicYears.length === 0) {
      return res.status(404).json({ message: 'Current academic year not found' });
    }
    const academicYearId = academicYears[0].id;

    // Get course registrations
    const [courseRegs] = await db.query(`
      SELECT
        c.course_code,
        c.course_name,
        c.credits,
        COUNT(cs.student_id) as registered_students,
        sco.max_seats,
        sco.available_seats
      FROM
        courses c
      INNER JOIN
        semester_course_offerings sco ON c.id = sco.course_id
      LEFT JOIN
        course_selections cs ON c.id = cs.course_id AND cs.academic_year_id = sco.academic_year_id
      WHERE
        sco.faculty_id = ? AND sco.academic_year_id = ?
      GROUP BY
        c.id
    `, [facultyId, academicYearId]);

    res.json(courseRegs);
  } catch (error) {
    console.error('Error fetching course registrations:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;