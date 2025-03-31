import express from 'express';
import db from '../database/db.js';

const router = express.Router();

// Get all faculty details
router.get('/', async (req, res) => {
    try {
        const [faculty] = await db.promise().query('SELECT * FROM faculty');
        res.json(faculty);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get courses assigned to a faculty
router.get('/:faculty_id/courses', async (req, res) => {
    const { faculty_id } = req.params;
    try {
        const [courses] = await db.promise().query(
            'SELECT c.course_code, c.course_name, fc.semester, fc.batch FROM courses c JOIN faculty_courses fc ON c.id = fc.course_id WHERE fc.faculty_id = ?',
            [faculty_id]
        );
        res.json(courses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Assign a course to a faculty
router.post('/:faculty_id/assign-course', async (req, res) => {
    const { faculty_id } = req.params;
    const { course_id, semester, batch } = req.body;
    try {
        await db.promise().query(
            'INSERT INTO faculty_courses (faculty_id, course_id, semester, batch) VALUES (?, ?, ?, ?)',
            [faculty_id, course_id, semester, batch]
        );
        res.status(201).json({ message: 'Course assigned to faculty successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
