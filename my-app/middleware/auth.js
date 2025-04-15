const { pool } = require('../database/db');

const verifyAdmin = async (req, res, next) => {
  try {
    const role = req.session.role;
    const userId = req.session.userId;
    
    if (!role || !userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const [rows] = await pool.query('SELECT * FROM admin WHERE id = ?', [userId]);
    
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Admin not found' });
    }

    req.admin = rows[0];
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const verifyFaculty = async (req, res, next) => {
  try {
    const role = req.session.role;
    const userId = req.session.userId;
    
    if (!role || !userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (role !== 'faculty') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const [rows] = await pool.query('SELECT * FROM faculty WHERE id = ?', [userId]);
    
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Faculty not found' });
    }

    req.faculty = rows[0];
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const verifyStudent = async (req, res, next) => {
  try {
    const role = req.session.role;
    const userId = req.session.userId;
    
    if (!role || !userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (role !== 'student') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const [rows] = await pool.query('SELECT * FROM students WHERE student_id = ?', [userId]);
    
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Student not found' });
    }

    req.student = rows[0];
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  verifyAdmin,
  verifyFaculty,
  verifyStudent
}; 