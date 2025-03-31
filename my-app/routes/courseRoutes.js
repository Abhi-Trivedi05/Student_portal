import express from 'express';
import db from '../database/db.js';

const router = express.Router();

// Get all courses
router.get('/', async (req, res) => {
    try {
        const [courses] = await db.promise().query('SELECT * FROM courses');
        res.json(courses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add a new course with faculty details
router.post('/', async (req, res) => {
    const { course_code, course_name, credits, department, faculty_id, semester, batch } = req.body;
    try {
        // Insert the new course into the courses table
        const [result] = await db.promise().query(
            'INSERT INTO courses (course_code, course_name, credits, department) VALUES (?, ?, ?, ?)',
            [course_code, course_name, credits, department]
        );

        const course_id = result.insertId; // Get the ID of the inserted course

        // Insert the course-faculty relationship into faculty_courses table
        await db.promise().query(
            'INSERT INTO faculty_courses (faculty_id, course_id, semester, batch) VALUES (?, ?, ?, ?)',
            [faculty_id, course_id, semester, batch]
        );

        res.status(201).json({ message: 'Course added successfully with faculty details' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update a course with faculty details
router.put('/:course_code', async (req, res) => {
    const { course_code } = req.params;
    const { course_name, credits, department, faculty_id, semester, batch } = req.body;
    
    try {
        const [existingCourse] = await db.promise().query('SELECT * FROM courses WHERE course_code = ?', [course_code]);
        if (existingCourse.length === 0) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Update course details in courses table
        await db.promise().query(
            'UPDATE courses SET course_name = ?, credits = ?, department = ? WHERE course_code = ?',
            [course_name, credits, department, course_code]
        );

        // Update the faculty_courses table for this course
        await db.promise().query(
            'UPDATE faculty_courses SET faculty_id = ?, semester = ?, batch = ? WHERE course_id = (SELECT id FROM courses WHERE course_code = ?)',
            [faculty_id, semester, batch, course_code]
        );

        res.json({ message: 'Course updated successfully with faculty details' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a course by course_code
router.delete('/:course_code', async (req, res) => {
    const { course_code } = req.params;
    
    try {
        const [existingCourse] = await db.promise().query('SELECT * FROM courses WHERE course_code = ?', [course_code]);
        if (existingCourse.length === 0) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Delete course-faculty relationship first from faculty_courses table
        await db.promise().query(
            'DELETE FROM faculty_courses WHERE course_id = (SELECT id FROM courses WHERE course_code = ?)',
            [course_code]
        );

        // Delete the course from the courses table
        await db.promise().query('DELETE FROM courses WHERE course_code = ?', [course_code]);
        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
