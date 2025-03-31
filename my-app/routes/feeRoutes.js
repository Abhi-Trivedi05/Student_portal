import express from 'express';
import db from '../database/db.js';

const router = express.Router();

// Add fee transaction for a student
router.post('/:student_id/fee', async (req, res) => {
    const { student_id } = req.params;
    const { transaction_date, bank_name, amount, reference_number } = req.body;
    try {
        await db.promise().query(
            'INSERT INTO fee_transactions (student_id, transaction_date, bank_name, amount, reference_number) VALUES (?, ?, ?, ?, ?)',
            [student_id, transaction_date, bank_name, amount, reference_number]
        );
        res.status(201).json({ message: 'Fee transaction added successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
