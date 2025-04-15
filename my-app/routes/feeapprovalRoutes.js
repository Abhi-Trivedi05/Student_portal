// src/routes/approvalRoutes.js
import express from 'express';
import db from '../database/db.js';

const router = express.Router();

// Get all fee transactions with optional filters
router.get('/fee-transactions', async (req, res) => {
  try {
    const { status, academicYearId, semester } = req.query;
    
    // Build the SQL query with filters
    let sql = `
      SELECT 
        ft.id,
        ft.student_id,
        s.name AS student_name,
        ft.transaction_date,
        ft.bank_name,
        ft.amount,
        ft.reference_number,
        ft.status,
        ft.semester,
        ay.year_name AS academic_year,
        ay.id AS academic_year_id
      FROM fee_transactions ft
      JOIN students s ON ft.student_id = s.student_id
      JOIN academic_years ay ON ft.academic_year_id = ay.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    
    // Add filters if provided
    if (status && status !== 'All') {
      sql += ' AND ft.status = ?';
      queryParams.push(status);
    }
    
    if (academicYearId) {
      sql += ' AND ft.academic_year_id = ?';
      queryParams.push(academicYearId);
    }
    
    if (semester) {
      sql += ' AND ft.semester = ?';
      queryParams.push(semester);
    }
    
    sql += ' ORDER BY ft.transaction_date DESC';
    
    const [transactions] = await db.query(sql, queryParams);
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching fee transactions:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Get a specific fee transaction by ID
router.get('/fee-transactions/:id', async (req, res) => {
  try {
    const transactionId = req.params.id;
    
    // Query to get transaction details with student info
    const query = `
      SELECT 
        ft.id,
        ft.student_id,
        s.name AS student_name,
        ft.amount,
        ft.transaction_date,
        ft.status,
        ft.reference_number,
        ft.bank_name,
        ft.semester,
        ay.year_name AS academic_year,
        ay.id AS academic_year_id,
        s.programme,
        s.department,
        s.current_semester
      FROM fee_transactions ft
      JOIN students s ON ft.student_id = s.student_id
      JOIN academic_years ay ON ft.academic_year_id = ay.id
      WHERE ft.id = ?
    `;
    
    const [transactions] = await db.query(query, [transactionId]);
    
    if (transactions.length === 0) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json(transactions[0]);
    
  } catch (error) {
    console.error('Error fetching transaction details:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all academic years
router.get('/academic-years', async (req, res) => {
  try {
    const [years] = await db.query('SELECT id, year_name, is_current FROM academic_years ORDER BY start_date DESC');
    res.json(years);
  } catch (error) {
    console.error('Error fetching academic years:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Approve a fee transaction
router.put('/fee-transactions/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_id } = req.body; // Admin's ID in the request
    
    if (!admin_id) {
      return res.status(400).json({ message: 'Admin ID is required' });
    }
    
    // Start a transaction
    await db.query('START TRANSACTION');
    
    // Update the transaction status to 'Paid'
    await db.query('UPDATE fee_transactions SET status = "Paid" WHERE id = ?', [id]);
    
    // Insert a record in fee_approvals table
    await db.query(`
      INSERT INTO fee_approvals (
        fee_transaction_id, 
        admin_id, 
        approval_date, 
        status, 
        remarks
      ) VALUES (?, ?, NOW(), 'Approved', 'Payment approved')
    `, [id, admin_id]);
    
    // Get the transaction details to update semester_registrations if needed
    const [transaction] = await db.query(
      'SELECT student_id, semester, academic_year_id FROM fee_transactions WHERE id = ?', 
      [id]
    );
    
    // if (transaction.length > 0) {
    //   // Update the semester_registrations status
    //   await db.query(`
    //     UPDATE semester_registrations 
    //     SET status = 'Completed' 
    //     WHERE student_id = ? AND semester = ? AND academic_year_id = ?
    //   `, [transaction[0].student_id, transaction[0].semester, transaction[0].academic_year_id]);
    // }
    
    // Commit the transaction
    await db.query('COMMIT');
    
    res.json({ message: 'Fee payment approved successfully' });
  } catch (error) {
    // Rollback on error
    await db.query('ROLLBACK');
    console.error('Error approving fee payment:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Reject a fee transaction
// Reject a fee transaction
router.put('/fee-transactions/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_id, reason } = req.body;  // Add reason to destructuring
    
    if (!admin_id) {
      return res.status(400).json({ message: 'Admin ID is required' });
    }
    
    // Start transaction
    await db.query('START TRANSACTION');
    
    // Update the fee transaction to add rejection reason and set status
    await db.query('UPDATE fee_transactions SET status = "Rejected" WHERE id = ?', [id]);
  
    // Insert a record in fee_approvals table for rejection
    await db.query(`
      INSERT INTO fee_approvals (
        fee_transaction_id, 
        admin_id, 
        approval_date, 
        status,
        remarks
      ) VALUES (?, ?, NOW(), 'Rejected', ?)
    `, [id, admin_id, reason || 'Payment rejected']);  // Include reason in query
    
    // Commit transaction
    await db.query('COMMIT');
    
    res.json({ message: 'Fee payment rejected successfully' });
  } catch (error) {
    // Rollback on error
    await db.query('ROLLBACK');
    console.error('Error rejecting fee payment:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

export default router;