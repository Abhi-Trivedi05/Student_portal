import express from 'express';
import FeeTransaction from '../models/FeeTransaction.js';
import Student from '../models/Student.js';
import AcademicYear from '../models/AcademicYear.js';
import FeeApproval from '../models/FeeApproval.js';

const router = express.Router();

// Get all fee transactions with optional filters
router.get('/fee-transactions', async (req, res) => {
  try {
    const { status, academicYearId, semester } = req.query;
    
    // Build the Mongoose query
    let query = {};
    
    if (status && status !== 'All') {
      query.status = status;
    }
    
    if (academicYearId) {
      query.academic_year_id = academicYearId;
    }
    
    if (semester) {
      query.semester = semester;
    }
    
    const transactions = await FeeTransaction.find(query)
      .populate('student_id', 'name') // Assuming student_id maps to student_id field in Student model or _id
      .populate('academic_year_id', 'year_name')
      .sort({ transaction_date: -1 });

    const formattedTransactions = [];

    for (const ft of transactions) {
        // Find student by student_id string if needed
        let studentName = 'Unknown';
        if (ft.student_id) {
            const student = await Student.findOne({ student_id: ft.student_id });
            if (student) studentName = student.name;
        }

        formattedTransactions.push({
            id: ft._id,
            student_id: ft.student_id,
            student_name: studentName,
            transaction_date: ft.transaction_date,
            bank_name: ft.bank_name,
            amount: ft.amount,
            reference_number: ft.reference_number,
            status: ft.status,
            semester: ft.semester,
            academic_year: ft.academic_year_id ? ft.academic_year_id.year_name : 'Unknown',
            academic_year_id: ft.academic_year_id ? ft.academic_year_id._id : null
        });
    }

    res.json(formattedTransactions);
  } catch (error) {
    console.error('Error fetching fee transactions:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Get a specific fee transaction by ID
router.get('/fee-transactions/:id', async (req, res) => {
  try {
    const transactionId = req.params.id;
    
    const ft = await FeeTransaction.findById(transactionId)
        .populate('academic_year_id', 'year_name');
    
    if (!ft) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    const student = await Student.findOne({ student_id: ft.student_id });
    
    const result = {
        id: ft._id,
        student_id: ft.student_id,
        student_name: student ? student.name : 'Unknown',
        amount: ft.amount,
        transaction_date: ft.transaction_date,
        status: ft.status,
        reference_number: ft.reference_number,
        bank_name: ft.bank_name,
        semester: ft.semester,
        academic_year: ft.academic_year_id ? ft.academic_year_id.year_name : 'Unknown',
        academic_year_id: ft.academic_year_id ? ft.academic_year_id._id : null,
        programme: student ? student.programme : 'Unknown',
        department: student ? student.department : 'Unknown',
        current_semester: student ? student.current_semester : 'Unknown'
    };
    
    res.json(result);
    
  } catch (error) {
    console.error('Error fetching transaction details:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all academic years
router.get('/academic-years', async (req, res) => {
  try {
    const years = await AcademicYear.find().sort({ start_date: -1 });
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
    const { admin_id } = req.body; 
    
    if (!admin_id) {
      return res.status(400).json({ message: 'Admin ID is required' });
    }
    
    const ft = await FeeTransaction.findByIdAndUpdate(id, { status: 'Paid' }, { new: true });
    
    if (!ft) {
        return res.status(404).json({ message: 'Transaction not found' });
    }

    await FeeApproval.create({
        fee_transaction_id: id,
        admin_id: admin_id,
        approval_date: new Date(),
        status: 'Approved',
        remarks: 'Payment approved'
    });
    
    res.json({ message: 'Fee payment approved successfully' });
  } catch (error) {
    console.error('Error approving fee payment:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Reject a fee transaction
router.put('/fee-transactions/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_id, reason } = req.body; 
    
    if (!admin_id) {
      return res.status(400).json({ message: 'Admin ID is required' });
    }
    
    const ft = await FeeTransaction.findByIdAndUpdate(id, { status: 'Rejected' }, { new: true });
  
    if (!ft) {
        return res.status(404).json({ message: 'Transaction not found' });
    }

    await FeeApproval.create({
        fee_transaction_id: id,
        admin_id: admin_id,
        approval_date: new Date(),
        status: 'Rejected',
        remarks: reason || 'Payment rejected'
    });
    
    res.json({ message: 'Fee payment rejected successfully' });
  } catch (error) {
    console.error('Error rejecting fee payment:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

export default router;