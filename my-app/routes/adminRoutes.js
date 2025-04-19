import express from 'express';
import db from '../database/db.js';

const router = express.Router();

// Middleware to verify admin role
const verifyAdmin = (req, res, next) => {
    const role = req.header('Role'); 

    if (!role) {
        return res.status(401).json({ success: false, message: "Authorization denied: No role found." });
    }

    if (role !== 'admin') {
        return res.status(403).json({ success: false, message: "Access denied: Admin role required." });
    }

    next();
};

// Add Faculty Route (Admin only)
router.post('/add-faculty', verifyAdmin, async (req, res) => {
    const { name, department, qualifications, email, phone_number, password } = req.body;
    
    // Validate required fields
    if (!name || !department || !email || !password) {
        return res.status(400).json({ 
            success: false, 
            message: "Please provide all required fields: name, department, email, and password." 
        });
    }
    
    try {
        // Store password directly without hashing
        const query = 'INSERT INTO faculty (name, department, qualifications, email, phone_number, password) VALUES (?, ?, ?, ?, ?, ?)';
        await db.query(query, [name, department, qualifications, email, phone_number, password]);
        
        res.json({ success: true, message: "Faculty added successfully!" });
    } catch (error) {
        console.error("Error adding faculty:", error);
        
        // Handle duplicate email or phone error
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ 
                success: false, 
                message: "Email or phone number already exists." 
            });
        }
        
        res.status(500).json({ success: false, message: "Error adding faculty." });
    }
});

// Add Student Route (Admin only)
router.post('/add-student', verifyAdmin, async (req, res) => {
    const { student_id, name, programme, department, cpi, current_semester, batch, faculty_advisor_id, password } = req.body;
    
    // Validate required fields
    if (!student_id || !name || !programme || !department || !current_semester || !batch || !password) {
        return res.status(400).json({ 
            success: false, 
            message: "Please provide all required fields including password." 
        });
    }
    
    try {
      // Begin transaction
      await db.query('START TRANSACTION');
      
      // Check if the batch exists in academic_years table
      const batchYear = batch.split('-')[1]; // Extract starting year from batch (e.g., "2023" from "2023-27")
      const academicYearQuery = 'SELECT id FROM academic_years WHERE year_name = ?';
      const [academicYears] = await db.query(academicYearQuery, [batch]);
      
      // If batch doesn't exist in academic_years, add it
      if (academicYears.length === 0) {
        // Calculate start and end dates based on batch
        const startYear = parseInt(batchYear);
        const endYear = parseInt(batch.split('-')[1]) || (startYear + 4); // Default to 4 years if end not specified
        
        // Create academic year entry
        // Assuming academic year starts on July 1st and ends on June 30th
        const startDate = `${startYear}-07-01`;
        const endDate = `${endYear}-06-30`;
        
        const insertAcademicYearQuery = 'INSERT INTO academic_years (year_name, start_date, end_date, is_current) VALUES (?, ?, ?, ?)';
        await db.query(insertAcademicYearQuery, [
          batch, 
          startDate, 
          endDate,
          1 // Setting as current (1 = true)
        ]);
        
        console.log(`Created new academic year entry for batch: ${batch}`);
      }
      
      // Insert student data
        const query = 'INSERT INTO students (student_id, name, programme, department, cpi, current_semester, batch, faculty_advisor_id, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
        await db.query(query, [student_id, name, programme, department, cpi, current_semester, batch, faculty_advisor_id, password]);
      
      // Commit the transaction
      await db.query('COMMIT');
        
        res.json({ success: true, message: "Student added successfully!" });
    } catch (error) {
      // Rollback in case of error
      await db.query('ROLLBACK');
      
        console.error("Error adding student:", error);
        
        // Handle duplicate student_id error
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ 
                success: false, 
                message: "Student ID already exists." 
            });
        }
        
        res.status(500).json({ success: false, message: "Error adding student." });
    }
});
// Add Course Route (Admin only)
router.post('/add-course', verifyAdmin, async (req, res) => {
    const { 
        course_code, 
        course_name, 
        credits, 
        department, 
        faculty_id, 
        semester, 
        batch, 
        max_seats = 60, // Default value if not provided
        academic_year_id // This needs to be provided
    } = req.body;
    
    // Validate required fields
    if (!course_code || !course_name || !credits || !department) {
        return res.status(400).json({ 
            success: false, 
            message: "Please provide all required fields: course code, name, credits, and department." 
        });
    }
    
    // Validate faculty assignment and course offering data
    if (!faculty_id || !semester || !batch || !academic_year_id) {
        return res.status(400).json({ 
            success: false, 
            message: "Please provide faculty ID, semester, batch, and academic year ID for course offering." 
        });
    }
    
    try {
        // Begin transaction
        await db.query('START TRANSACTION');
        
        // 1. First insert the course
        const courseQuery = 'INSERT INTO courses (course_code, course_name, credits, department) VALUES (?, ?, ?, ?)';
        const [courseResult] = await db.query(courseQuery, [
            course_code, 
            course_name, 
            Number(credits), // Ensure credits is a number
            department
        ]);
        
        // 2. Get the newly inserted course id
        const courseId = courseResult.insertId;
        
        // 3. Insert into faculty_courses table to establish the relationship
        if (faculty_id && semester && batch) {
            const facultyCourseQuery = 'INSERT INTO faculty_courses (faculty_id, course_id, semester, batch) VALUES (?, ?, ?, ?)';
            await db.query(facultyCourseQuery, [
                Number(faculty_id), // Ensure faculty_id is a number
                courseId,
                Number(semester), // Ensure semester is a number
                batch
            ]);
        }
        
        // 4. Insert into semester_course_offerings table
            const offeringQuery = `
                INSERT INTO semester_course_offerings 
                (course_id, semester, academic_year_id, max_seats, available_seats, faculty_id) 
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            
            await db.query(offeringQuery, [
                courseId,
                Number(semester),
            Number(academic_year_id),
            Number(max_seats),
            Number(max_seats), // Initially available seats equals max seats
                Number(faculty_id)
            ]);
        
        // Commit transaction
        await db.query('COMMIT');
        
        res.json({ 
            success: true, 
            message: "Course added successfully and offering created for the specified semester!" 
        });
    } catch (error) {
        // Rollback in case of error
        await db.query('ROLLBACK');
        
        console.error("Error adding course:", error);
        
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ 
                success: false, 
                message: "Course with this code already exists or this offering already exists for the semester." 
            });
        } else if (error.code === 'ER_NO_REFERENCED_ROW') {
            return res.status(400).json({ 
                success: false, 
                message: "One of the provided IDs (faculty, academic year) does not exist." 
            });
        } else {
            return res.status(500).json({ 
                success: false, 
                message: "Error adding course: " + error.message
            });
        }
    }
});

router.get('/get-courses', verifyAdmin, async (req, res) => {
    try {
        // Join courses with faculty_courses and faculty to get complete information
        const query = `
            SELECT c.*, fc.semester, fc.batch, f.id as faculty_id, f.name as faculty_name
            FROM courses c
            LEFT JOIN faculty_courses fc ON c.id = fc.course_id
            LEFT JOIN faculty f ON fc.faculty_id = f.id
        `;
        
        const [results] = await db.query(query);
        
        if (!results || results.length === 0) {
            return res.status(404).json({ success: false, message: 'No courses found.' });
        }
        
        res.status(200).json({ courses: results });
    } catch (error) {
        console.error("Error fetching courses:", error);
        res.status(500).json({ success: false, message: "Error fetching courses." });
    }
});


// Add Fee Transaction Route
router.post('/add-fee-transaction', async (req, res) => {
    const { student_id, transaction_date, bank_name, amount, reference_number, status } = req.body;
    const query = 'INSERT INTO fee_transactions (student_id, transaction_date, bank_name, amount, reference_number, status) VALUES (?, ?, ?, ?, ?, ?)';

    try {
        await db.query(query, [student_id, transaction_date, bank_name, amount, reference_number, status]);
        res.json({ success: true, message: "Fee transaction added successfully!" });
    } catch (error) {
        console.error("Error adding fee transaction:", error);
        res.status(500).json({ success: false, message: "Error adding fee transaction." });
    }
});

// Get Fee Transactions for a Student
router.get('/get-fee-transactions/:student_id', async (req, res) => {
    const { student_id } = req.params;
    const query = 'SELECT * FROM fee_transactions WHERE student_id = ?';

    try {
        const [results] = await db.query(query, [student_id]);
        if (!results || results.length === 0) {
            return res.status(404).json({ success: false, message: 'No fee transactions found for this student.' });
        }
        res.status(200).json({ fee_transactions: results });
    } catch (error) {
        console.error("Error fetching fee transactions:", error);
        res.status(500).json({ success: false, message: "Error fetching fee transactions." });
    }
});

router.get('/faculty/:faculty_id', verifyAdmin, async (req, res) => {
    const { faculty_id } = req.params;
    
    try {
        const [results] = await db.query('SELECT * FROM faculty WHERE id = ?', [faculty_id]);
        
        if (!results || results.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Faculty not found.' 
            });
        }
        
        // Don't send password in the response for security
        const faculty = results[0];
        // Uncomment the next line if you want to hide the password in the response
        // delete faculty.password;
        
        res.status(200).json(faculty);
    } catch (error) {
        console.error("Error fetching faculty:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching faculty: " + error.message 
        });
    }
});

// Edit Faculty Route (Admin only)
router.put('/edit-faculty/:faculty_id', verifyAdmin, async (req, res) => {
    const { faculty_id } = req.params;
    const { name, department, qualifications, email, phone_number, password, status } = req.body;
    
    try {
        // Start with base query
        let updateFields = [];
        let params = [];
        
        // Build query dynamically based on provided fields
        if (name !== undefined) {
            updateFields.push('name = ?');
            params.push(name);
        }
        
        if (department !== undefined) {
            updateFields.push('department = ?');
            params.push(department);
        }
        
        if (qualifications !== undefined) {
            updateFields.push('qualifications = ?');
            params.push(qualifications);
        }
        
        if (email !== undefined) {
            updateFields.push('email = ?');
            params.push(email);
        }
        
        if (phone_number !== undefined) {
            updateFields.push('phone_number = ?');
            params.push(phone_number);
        }
        
        if (status !== undefined) {
            updateFields.push('status = ?');
            params.push(status);
        }
        
        // Handle password update if provided and not empty
        if (password !== undefined && password.trim() !== '') {
            updateFields.push('password = ?');
            params.push(password);
        }
        
        // Check if there are fields to update
        if (updateFields.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: "No fields to update" 
            });
        }
        
        // Construct and execute the final query
        const query = `UPDATE faculty SET ${updateFields.join(', ')} WHERE id = ?`;
        params.push(faculty_id);
        
        const [result] = await db.query(query, params);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "Faculty not found or no changes made" 
            });
        }
        
        res.json({ 
            success: true, 
            message: "Faculty updated successfully!" 
        });
    } catch (error) {
        console.error("Error updating faculty:", error);
        
        // Handle duplicate email or phone error
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ 
                success: false, 
                message: "Email or phone number already exists." 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: "Error updating faculty: " + error.message 
        });
    }
});
router.get('/course/:course_id', verifyAdmin, async (req, res) => {
    const { course_id } = req.params;
    
    try {
        // Make sure we're parsing the course_id as an integer since it's an INT in the database
        const courseIdInt = parseInt(course_id, 10);
        
        if (isNaN(courseIdInt)) {
            return res.status(400).json({ success: false, message: 'Invalid course ID format.' });
        }
        
        // Use proper JOIN syntax to get the faculty information
        const query = `
            SELECT c.id, c.course_code, c.course_name, c.credits, c.department, 
                   fc.semester, fc.batch, f.id as faculty_id, f.name as faculty_name
            FROM courses c
            LEFT JOIN faculty_courses fc ON c.id = fc.course_id
            LEFT JOIN faculty f ON fc.faculty_id = f.id
            WHERE c.id = ?
        `;
        
        const [results] = await db.query(query, [courseIdInt]);
        
        if (!results || results.length === 0) {
            return res.status(404).json({ success: false, message: 'Course not found.' });
        }
        
        res.status(200).json(results[0]);
    } catch (error) {
        console.error("Error fetching course:", error);
        res.status(500).json({ success: false, message: "Error fetching course: " + error.message });
    }
});

// Updated Edit Student Route (Admin only)
router.put('/edit-student/:student_id', verifyAdmin, async (req, res) => {
    const { student_id } = req.params;
    const { name, programme, roll_number, department, current_semester, batch, cpi, faculty_advisor_id, password, status } = req.body;
    
    try {
      // Begin transaction
      await db.query('START TRANSACTION');
      
      // If batch is being updated, check if it exists in academic_years
      if (batch !== undefined) {
        const batchYear = batch.split('-')[0]; // Extract starting year from batch
        const academicYearQuery = 'SELECT id FROM academic_years WHERE year_name = ?';
        const [academicYears] = await db.query(academicYearQuery, [batch]);
        
        // If batch doesn't exist in academic_years, add it
        if (academicYears.length === 0) {
          // Calculate start and end dates based on batch
          const startYear = parseInt(batchYear);
          const endYear = parseInt(batch.split('-')[1]) || (startYear + 4); // Default to 4 years if end not specified
          
          // Create academic year entry
          const startDate = `${startYear}-07-01`;
          const endDate = `${endYear}-06-30`;
          
          const insertAcademicYearQuery = 'INSERT INTO academic_years (year_name, start_date, end_date, is_current) VALUES (?, ?, ?, ?)';
          await db.query(insertAcademicYearQuery, [
            batch, 
            startDate, 
            endDate,
            1 // Setting as current (1 = true)
          ]);
          
          console.log(`Created new academic year entry for batch: ${batch}`);
        }
      }
      
      // Start with base query without password
      let query = 'UPDATE students SET ';
      let params = [];
      let updateFields = [];
      
      // Build query dynamically based on provided fields
      if (name !== undefined) {
        updateFields.push('name = ?');
        params.push(name);
      }
      
      if (programme !== undefined) {
        updateFields.push('programme = ?');
        params.push(programme);
      }
      
      if (roll_number !== undefined && roll_number !== student_id) {
        // Only update student_id if it's changed
        updateFields.push('student_id = ?');
        params.push(roll_number);
      }
      
      if (department !== undefined) {
        updateFields.push('department = ?');
        params.push(department);
      }
      
      if (current_semester !== undefined) {
        updateFields.push('current_semester = ?');
        params.push(current_semester);
      }
      
      if (batch !== undefined) {
        updateFields.push('batch = ?');
        params.push(batch);
      }
      
      if (cpi !== undefined) {
        updateFields.push('cpi = ?');
        params.push(cpi);
      }
      
      if (faculty_advisor_id !== undefined) {
        updateFields.push('faculty_advisor_id = ?');
        params.push(faculty_advisor_id);
      }
      
      if (status !== undefined) {
        updateFields.push('status = ?');
        params.push(status);
      }
      
      // Handle password update if provided
      if (password !== undefined && password.trim() !== '') {
        updateFields.push('password = ?');
        params.push(password); // Store password directly without hashing
      }
      
      // Finish the query
      query += updateFields.join(', ');
      query += ' WHERE student_id = ?';
      params.push(student_id);
      
      // Execute the query only if there are fields to update
      if (updateFields.length > 0) {
        const [result] = await db.query(query, params);
        
        if (result.affectedRows === 0) {
          await db.query('ROLLBACK');
          return res.status(404).json({ success: false, message: "Student not found" });
        }
        
        // Commit the transaction
        await db.query('COMMIT');
        return res.json({ success: true, message: "Student updated successfully!" });
      } else {
        await db.query('ROLLBACK');
        return res.status(400).json({ success: false, message: "No fields to update" });
      }
    } catch (error) {
      // Rollback in case of error
      await db.query('ROLLBACK');
      
      console.error("Error updating student:", error);
      
      // Handle duplicate student_id error
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ 
            success: false, 
          message: "Student ID already exists."
        });
      }
      
      res.status(500).json({ success: false, message: "Error updating student: " + error.message });
    }
  });
// Updated endpoint to fetch a single student by ID
router.get('/student/:student_id', verifyAdmin, async (req, res) => {
    const { student_id } = req.params;
    const query = 'SELECT student_id as id, name, programme, department, cpi, current_semester as semester, batch, faculty_advisor_id FROM students WHERE student_id = ?';
    
    try {
        const [results] = await db.query(query, [student_id]);
        
        if (!results || results.length === 0) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }
        
        // Return student data and add roll_number for backward compatibility
        const student = results[0];
        student.roll_number = student.id;
        
        res.status(200).json(student);
    } catch (error) {
        console.error("Error fetching student:", error);
        res.status(500).json({ success: false, message: "Error fetching student: " + error.message });
    }
});

// Edit Course Route (Admin only)
router.put('/edit-course/:course_id', verifyAdmin, async (req, res) => {
    const { course_id } = req.params;
    const { 
        course_code, 
        course_name, 
        credits, 
        department, 
        faculty_id, 
        semester, 
        batch,
        max_seats,
        academic_year_id
    } = req.body;
    
    try {
        const courseIdInt = parseInt(course_id, 10);
        
        if (isNaN(courseIdInt)) {
            return res.status(400).json({ success: false, message: 'Invalid course ID format.' });
        }
        
        // Begin transaction
        await db.query('START TRANSACTION');
        
        // Build dynamic update query based on provided fields for courses table
        let updateFields = [];
        let params = [];
        
        // Only add fields that are provided
        if (course_code !== undefined) {
            updateFields.push('course_code = ?');
            params.push(course_code);
        }
        
        if (course_name !== undefined) {
            updateFields.push('course_name = ?');
            params.push(course_name);
        }
        
        if (credits !== undefined) {
            updateFields.push('credits = ?');
            params.push(Number(credits));
        }
        
        if (department !== undefined) {
            updateFields.push('department = ?');
            params.push(department);
        }
        
        // Only proceed with update if there are fields to update
        if (updateFields.length > 0) {
            const courseQuery = `UPDATE courses SET ${updateFields.join(', ')} WHERE id = ?`;
            params.push(courseIdInt);
            
            const [courseResult] = await db.query(courseQuery, params);
            
            if (courseResult.affectedRows === 0) {
                await db.query('ROLLBACK');
                return res.status(404).json({ success: false, message: "Course not found" });
            }
        }
        
        // Handle faculty_courses relationship
        if (faculty_id && semester && batch) {
            // Check if faculty_courses entry exists
            const [existingFacultyCourse] = await db.query(
                'SELECT id FROM faculty_courses WHERE course_id = ? AND semester = ? AND batch = ?',
                [courseIdInt, Number(semester), batch]
            );
            
            if (existingFacultyCourse.length > 0) {
                // Update existing faculty_courses entry
            await db.query(
                    'UPDATE faculty_courses SET faculty_id = ? WHERE course_id = ? AND semester = ? AND batch = ?',
                    [Number(faculty_id), courseIdInt, Number(semester), batch]
                );
            } else {
                // Insert new faculty_courses entry
                await db.query(
                    'INSERT INTO faculty_courses (faculty_id, course_id, semester, batch) VALUES (?, ?, ?, ?)',
                    [Number(faculty_id), courseIdInt, Number(semester), batch]
                );
            }
        }
        
        // Handle semester_course_offerings table
        if (academic_year_id && semester) {
            // Check if semester_course_offerings entry exists
            const [existingOffering] = await db.query(
                'SELECT id, available_seats, max_seats FROM semester_course_offerings WHERE course_id = ? AND semester = ? AND academic_year_id = ?',
                [courseIdInt, Number(semester), Number(academic_year_id)]
            );
            
            if (existingOffering.length > 0) {
                // Update existing offering
                const offeringId = existingOffering[0].id;
                let offeringUpdateFields = [];
                let offeringParams = [];
                
                if (faculty_id !== undefined) {
                    offeringUpdateFields.push('faculty_id = ?');
                    offeringParams.push(Number(faculty_id));
                }
                
                if (max_seats !== undefined) {
                    // Calculate the new available seats
                    // If max_seats increases, add the difference to available_seats
                    // If max_seats decreases, subtract from available_seats but don't go below 0
                    const currentMax = existingOffering[0].max_seats;
                    const currentAvailable = existingOffering[0].available_seats;
                    let newAvailable = currentAvailable;
                    
                    if (Number(max_seats) > currentMax) {
                        // Increase available seats by the difference in max seats
                        newAvailable += (Number(max_seats) - currentMax);
                    } else if (Number(max_seats) < currentMax) {
                        // Decrease available seats, but don't go below 0
                        const seatsDifference = currentMax - Number(max_seats);
                        newAvailable = Math.max(0, currentAvailable - seatsDifference);
                    }
                    
                    offeringUpdateFields.push('max_seats = ?');
                    offeringParams.push(Number(max_seats));
                    offeringUpdateFields.push('available_seats = ?');
                    offeringParams.push(newAvailable);
                }
                
                if (offeringUpdateFields.length > 0) {
                    const offeringQuery = `UPDATE semester_course_offerings SET ${offeringUpdateFields.join(', ')} WHERE id = ?`;
                    offeringParams.push(offeringId);
                    
                    await db.query(offeringQuery, offeringParams);
                }
            } else if (faculty_id) {
                // Insert new offering if it doesn't exist but we have faculty_id
                const newMaxSeats = max_seats || 60; // Default to 60 if not provided
                
                await db.query(
                    'INSERT INTO semester_course_offerings (course_id, semester, academic_year_id, max_seats, available_seats, faculty_id) VALUES (?, ?, ?, ?, ?, ?)',
                    [
                        courseIdInt,
                        Number(semester),
                        Number(academic_year_id),
                        Number(newMaxSeats),
                        Number(newMaxSeats),
                        Number(faculty_id)
                    ]
                );
            }
        }
        
        // Commit transaction
        await db.query('COMMIT');
        
        res.json({ success: true, message: "Course updated successfully!" });
    } catch (error) {
        // Rollback in case of error
        await db.query('ROLLBACK');
        
        console.error("Error updating course:", error);
        
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ 
            success: false, 
                message: "Course with this code already exists or this offering already exists for the semester." 
            });
        } else if (error.code === 'ER_NO_REFERENCED_ROW') {
            return res.status(400).json({ 
                success: false, 
                message: "One of the provided IDs (faculty, academic year) does not exist." 
            });
        } else {
            return res.status(500).json({ 
                success: false, 
                message: "Error updating course: " + error.message 
            });
        }
    }
});

// Remove Student Route (Admin only)
router.delete('/remove-student/:student_id', verifyAdmin, async (req, res) => {
    const { student_id } = req.params;
    const query = 'DELETE FROM students WHERE student_id = ?';

    try {
        const [result] = await db.query(query, [student_id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }
        res.json({ success: true, message: "Student removed successfully!" });
    } catch (error) {
        console.error("Error removing student:", error);
        res.status(500).json({ success: false, message: "Error removing student." });
    }
});

// Remove Faculty Route (Admin only)
router.delete('/remove-faculty/:faculty_id', verifyAdmin, async (req, res) => {
    const { faculty_id } = req.params;
    
    try {
        // Check if faculty exists first
        const [faculty] = await db.query('SELECT id, name FROM faculty WHERE id = ?', [faculty_id]);
        
        if (!faculty || faculty.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "Faculty not found" 
            });
        }
        
        const facultyName = faculty[0].name;
        
        // Begin transaction
        await db.query('START TRANSACTION');
        
        // First, remove faculty from any courses they're assigned to
        await db.query('DELETE FROM faculty_courses WHERE faculty_id = ?', [faculty_id]);
        
        // Then remove the faculty record
        const [result] = await db.query('DELETE FROM faculty WHERE id = ?', [faculty_id]);
        
        // Commit the transaction
        await db.query('COMMIT');
        
        res.json({ 
            success: true, 
            message: `Faculty '${facultyName}' removed successfully!` 
        });
    } catch (error) {
        // Rollback in case of error
        await db.query('ROLLBACK');
        
        console.error("Error removing faculty:", error);
        
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ 
                success: false, 
                message: "Cannot delete faculty because they are referenced in other parts of the system. Please reassign their responsibilities first." 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: "Error removing faculty: " + error.message 
        });
    }
});

router.delete('/remove-course/:course_id', verifyAdmin, async (req, res) => {
    const { course_id } = req.params;
    
    try {
        // Validate course_id is a number
        const courseIdInt = parseInt(course_id, 10);
        if (isNaN(courseIdInt)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid course ID format. Course ID must be a number." 
            });
        }
        
        // First check if the course exists
        const [courseExists] = await db.query(
            'SELECT id, course_code, course_name FROM courses WHERE id = ?', 
            [courseIdInt]
        );
        
        if (!courseExists || courseExists.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "Course not found with ID: " + courseIdInt 
            });
        }

        const courseName = courseExists[0].course_name;
        const courseCode = courseExists[0].course_code;
        
        // Begin transaction
        await db.query('START TRANSACTION');
        
        // Delete from all related tables in the correct order to respect foreign key constraints
        
        // 1. Delete from semester_course_offerings
        const [semesterOfferingsDeleted] = await db.query(
            'DELETE FROM semester_course_offerings WHERE course_id = ?', 
            [courseIdInt]
        );
        
        // 2. Delete from backlogs (if this table exists in your schema)
        let backlogsDeleted = { affectedRows: 0 };
        try {
            [backlogsDeleted] = await db.query(
                'DELETE FROM backlogs WHERE course_id = ?', 
                [courseIdInt]
            );
        } catch (error) {
            // If the backlogs table doesn't exist, just continue
            if (error.code !== 'ER_NO_SUCH_TABLE') {
                throw error;
            }
        }
        
        // 3. Delete from faculty_courses
        const [facultyCoursesDeleted] = await db.query(
            'DELETE FROM faculty_courses WHERE course_id = ?', 
            [courseIdInt]
        );
        
        // 4. Delete from course_selections
        const [courseSelectionsDeleted] = await db.query(
            'DELETE FROM course_selections WHERE course_id = ?', 
            [courseIdInt]
        );
        
        // 5. Finally, delete the course itself
        const [result] = await db.query(
            'DELETE FROM courses WHERE id = ?', 
            [courseIdInt]
        );
        
        // Commit transaction
        await db.query('COMMIT');
        
        res.json({ 
            success: true, 
            message: `Course "${courseCode} - ${courseName}" removed successfully!`,
            details: {
                courseId: courseIdInt,
                courseCode: courseCode,
                courseName: courseName,
                semesterOfferingsRemoved: semesterOfferingsDeleted.affectedRows,
                backlogsRemoved: backlogsDeleted.affectedRows,
                facultyCoursesRemoved: facultyCoursesDeleted.affectedRows,
                studentSelectionsRemoved: courseSelectionsDeleted.affectedRows
            }
        });
    } catch (error) {
        // Rollback in case of error
        await db.query('ROLLBACK');
        
        console.error("Error removing course:", error);
        
        // Check for more foreign key constraints
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            // Extract the table name from the error message using regex
            const tableMatch = error.sqlMessage.match(/`([^`]+)`\.`([^`]+)`/);
            const tableName = tableMatch ? tableMatch[2] : "unknown table";
            
        return res.status(400).json({ 
            success: false, 
                message: `Cannot delete course because it is still referenced in the ${tableName} table. Please remove those references first.`,
                details: error.sqlMessage
            });
        } else if (error.code === 'ER_NO_REFERENCED_ROW') {
            return res.status(400).json({ 
                success: false, 
                message: "One of the referenced records does not exist." 
            });
        } else {
            return res.status(500).json({ 
                success: false, 
                message: "Error removing course: " + (error.sqlMessage || error.message)
            });
        }
    }
});
// Get Faculty Route (Admin only)
    router.get('/get-faculty', verifyAdmin, async (req, res) => {
        try {
            const [results] = await db.query('SELECT * FROM faculty');
            
            if (!results || results.length === 0) {
            return res.status(404).json({ 
                success: false, 
                    message: 'No faculty found.' 
            });
        }
        
            res.status(200).json({ 
            success: true, 
                faculty: results 
        });
    } catch (error) {
            console.error("Error fetching faculty:", error);
        res.status(500).json({ 
            success: false, 
                message: "Error fetching faculty: " + error.message 
        });
    }
});
router.get('/get-course', async (req, res) => {
    const query = 'SELECT * FROM courses'; // SQL query to fetch course data

    try {
        const [results] = await db.query(query);
        if (!results || results.length === 0) {
            return res.status(404).json({ success: false, message: 'No course found.' });
        }
        res.status(200).json({ course: results });
    } catch (error) {
        console.error("Error fetching course:", error);
        res.status(500).json({ success: false, message: "Error fetching course." });
    }
});

// Get Students Route (Admin only)
router.get('/get-students', verifyAdmin, async (req, res) => {
    const query = 'SELECT * FROM students'; // SQL query to fetch all students

    try {
        const [results] = await db.query(query); // Execute SQL query
        if (!results || results.length === 0) {
            return res.status(404).json({ success: false, message: 'No students found.' });
        }
        res.status(200).json({ students: results });
    } catch (error) {
        console.error("Error fetching students:", error);
        res.status(500).json({ success: false, message: "Error fetching students." });
    }
});
router.get('/academic-years', verifyAdmin, async (req, res) => {     
    try {
      // Query to get all academic years ordered by start date (most recent first)         
      const [academicYears] = await db.query(`     
        SELECT                  
          id,                  
          year_name,                  
          start_date,                  
          end_date,                  
          is_current             
        FROM                  
          academic_years              
        ORDER BY                  
          start_date DESC       
      `);         
      // Remove the stray 'i' that's here
           
      // Return the fetched academic years         
      res.json({             
            success: true, 
        data: academicYears         
        });
    } catch (error) {
      console.error("Error fetching academic years:", error);         
        res.status(500).json({ 
            success: false, 
        message: "Error fetching academic years: " + (error.sqlMessage || error.message)         
        });
    }
});



export default router;