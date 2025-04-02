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
        CONCAT('REG', YEAR(sr.registration_date), sr.id) as registrationId,
        s.programme as course,
        CASE 
          WHEN ft.status = 'Paid' THEN 'Paid'
          WHEN ft.status = 'Pending' AND ft.amount IS NOT NULL THEN 'Partial'
          WHEN s.student_id IN (SELECT student_id FROM fee_transactions WHERE status = 'Pending' AND academic_year_id = ?) THEN 'Unpaid'
          ELSE 'Unpaid'
        END as feeStatus,
        CASE
          WHEN ft.status = 'Paid' THEN CONCAT('$', FORMAT(ft.amount, 2))
          WHEN ft.status = 'Pending' AND ft.amount IS NOT NULL THEN CONCAT('$', FORMAT(ft.amount, 2), '/$', FORMAT((SELECT SUM(amount) FROM fee_transactions WHERE student_id = s.student_id AND academic_year_id = ?), 2))
          ELSE CONCAT('$', FORMAT((SELECT SUM(amount) FROM fee_transactions WHERE student_id = s.student_id AND academic_year_id = ?), 2))
        END as feeAmount,
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
    `, [academicYearId, academicYearId, academicYearId, academicYearId, facultyId, academicYearId]);

    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update application status (approve or reject)
router.put('/:applicationId', async (req, res) => {
  const { applicationId } = req.params;
  const { status } = req.body;
  
  if (!['Completed', 'Failed'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  
  try {
    await db.query('UPDATE semester_registrations SET status = ? WHERE id = ?', [status, applicationId]);
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