// routes/feeApproval.js
import express from 'express';
import db from '../database/db.js'; // Ensure db is correctly imported

const router = express.Router();

// Get all fee transactions with optional filters
router.get('/', async (req, res) => {
  try {
    console.log('Fetching fee transactions...');
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
        ay.year_name AS academic_year
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
    console.log(`Found ${transactions.length} fee transactions`);
    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching fee transactions:', error);
    res.status(500).json({ error: 'Failed to fetch fee transactions' });
  }
});

// Get fee transactions by filter parameters - IMPORTANT: This must come before /:id route
router.get('/filter', async (req, res) => {
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
        ay.year_name AS academic_year
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
    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching filtered fee transactions:', error);
    res.status(500).json({ error: 'Failed to fetch fee transactions' });
  }
});

// Get all academic years
router.get('/academic-years', async (req, res) => {
  try {
    const [years] = await db.query('SELECT id, year_name, is_current FROM academic_years ORDER BY start_date DESC');
    res.status(200).json(years);
  } catch (error) {
    console.error('Error fetching academic years:', error);
    res.status(500).json({ error: 'Failed to fetch academic years' });
  }
});

// GET a specific fee transaction
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        ft.*, 
        s.name AS student_name,
        ay.year_name AS academic_year
      FROM fee_transactions ft
      JOIN students s ON ft.student_id = s.student_id
      JOIN academic_years ay ON ft.academic_year_id = ay.id
      WHERE ft.id = ?
    `, [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Fee transaction not found' });
    }
    
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Error fetching fee transaction:', error);
    res.status(500).json({ error: 'Failed to fetch fee transaction' });
  }
});

// POST create a new fee transaction
router.post('/', async (req, res) => {
  try {
    console.log('Creating fee transaction with data:', req.body);
    const { 
      student_id,
      academic_year_id,
      semester,
      transaction_date,
      bank_name,
      amount,
      reference_number
    } = req.body;
    
    // Validate required fields
    if (!student_id || !academic_year_id || !semester || !amount || !reference_number) {
      return res.status(400).json({ 
        error: 'Student ID, academic year, semester, amount, and reference number are required' 
      });
    }

    // Insert the fee transaction
    const [result] = await db.query(
      `INSERT INTO fee_transactions (
        student_id,
        academic_year_id,
        semester,
        transaction_date,
        bank_name,
        amount,
        reference_number,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        student_id,
        academic_year_id,
        semester,
        transaction_date || new Date(),
        bank_name || null,
        amount,
        reference_number,
        'Pending' // Default status
      ]
    );
    
    const newTransactionId = result.insertId;
    
    // Fetch the newly created fee transaction
    const [rows] = await db.query(`
      SELECT 
        ft.*, 
        s.name AS student_name,
        ay.year_name AS academic_year
      FROM fee_transactions ft
      JOIN students s ON ft.student_id = s.student_id
      JOIN academic_years ay ON ft.academic_year_id = ay.id
      WHERE ft.id = ?
    `, [newTransactionId]);
    
    console.log('Successfully created fee transaction with ID:', newTransactionId);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating fee transaction:', error);
    res.status(500).json({ error: 'Failed to create fee transaction' });
  }
});

// PUT approve a fee transaction
router.put('/:id/approve', async (req, res) => {
  try {
    console.log(`Approving fee transaction with ID: ${req.params.id}`);
    const { id } = req.params;
    
    // Update the transaction status to 'Paid'
    const [result] = await db.query('UPDATE fee_transactions SET status = "Paid" WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Fee transaction not found' });
    }
    
    // You may also want to update related tables, like semester_registrations
    try {
      await db.query(`
        UPDATE semester_registrations sr
        JOIN fee_transactions ft ON sr.student_id = ft.student_id 
          AND sr.semester = ft.semester 
          AND sr.academic_year_id = ft.academic_year_id
        SET sr.status = 'Completed'
        WHERE ft.id = ?
      `, [id]);
    } catch (innerError) {
      console.warn('Could not update semester registration:', innerError);
      // Continue execution as this is optional
    }
    
    // Fetch the updated transaction
    const [rows] = await db.query(`
      SELECT 
        ft.*, 
        s.name AS student_name,
        ay.year_name AS academic_year
      FROM fee_transactions ft
      JOIN students s ON ft.student_id = s.student_id
      JOIN academic_years ay ON ft.academic_year_id = ay.id
      WHERE ft.id = ?
    `, [id]);
    
    console.log('Successfully approved fee transaction');
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Error approving fee transaction:', error);
    res.status(500).json({ error: 'Failed to approve fee transaction' });
  }
});

// PUT reject a fee transaction
router.put('/:id/reject', async (req, res) => {
  try {
    console.log(`Rejecting fee transaction with ID: ${req.params.id}`);
    const { id } = req.params;
    const { rejection_reason } = req.body;
    
    // Update the transaction status to 'Rejected'
    const [result] = await db.query(
      'UPDATE fee_transactions SET status = "Rejected", rejection_reason = ? WHERE id = ?', 
      [rejection_reason || null, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Fee transaction not found' });
    }
    
    // Fetch the updated transaction
    const [rows] = await db.query(`
      SELECT 
        ft.*, 
        s.name AS student_name,
        ay.year_name AS academic_year
      FROM fee_transactions ft
      JOIN students s ON ft.student_id = s.student_id
      JOIN academic_years ay ON ft.academic_year_id = ay.id
      WHERE ft.id = ?
    `, [id]);
    
    console.log('Successfully rejected fee transaction');
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Error rejecting fee transaction:', error);
    res.status(500).json({ error: 'Failed to reject fee transaction' });
  }
});

// DELETE a fee transaction
router.delete('/:id', async (req, res) => {
  try {
    console.log(`Deleting fee transaction with ID: ${req.params.id}`);
    const [result] = await db.query('DELETE FROM fee_transactions WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Fee transaction not found' });
    }
    
    console.log('Successfully deleted fee transaction');
    res.status(200).json({ message: 'Fee transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting fee transaction:', error);
    res.status(500).json({ error: 'Failed to delete fee transaction' });
  }
});

export default router;