import express from 'express';
import db from '../database/db.js';

const router = express.Router();

// Get student details
router.get('/:student_id', async (req, res) => {
    const { student_id } = req.params;
    try {
        const [student] = await db.promise().query('SELECT * FROM students WHERE student_id = ?', [student_id]);
        if (student.length === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json(student[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Register a student
router.post('/', async (req, res) => {
    const { student_id, name, programme, department, cpi, current_semester, faculty_advisor_id } = req.body;
    try {
        await db.promise().query(
            'INSERT INTO students (student_id, name, programme, department, cpi, current_semester, faculty_advisor_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [student_id, name, programme, department, cpi, current_semester, faculty_advisor_id]
        );
        res.status(201).json({ message: 'Student registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Select a course for a student
router.post('/:student_id/select-course', async (req, res) => {
    const { student_id } = req.params;
    const { course_id, semester, is_elective } = req.body;
    try {
        await db.promise().query(
            'INSERT INTO course_selections (student_id, course_id, semester, is_elective) VALUES (?, ?, ?, ?)',
            [student_id, course_id, semester, is_elective]
        );
        res.status(201).json({ message: 'Course selected successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add a backlog for a student
router.post('/:student_id/add-backlog', async (req, res) => {
    const { student_id } = req.params;
    const { course_id, semester } = req.body;
    try {
        await db.promise().query(
            'INSERT INTO backlogs (student_id, course_id, semester) VALUES (?, ?, ?)',
            [student_id, course_id, semester]
        );
        res.status(201).json({ message: 'Backlog added successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add SPI for a student
router.post('/:student_id/spi', async (req, res) => {
    const { student_id } = req.params;
    const { semester, spi } = req.body;
    try {
        await db.promise().query(
            'INSERT INTO student_spi (student_id, semester, spi) VALUES (?, ?, ?)',
            [student_id, semester, spi]
        );
        res.status(201).json({ message: 'SPI added successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
