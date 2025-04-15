import express from 'express';
import db from '../database/db.js';

const router = express.Router();

// Get all announcements with optional filters
// In your announcements.js router file, update the GET route:

// Get all announcements with optional filters
router.get('/', async (req, res) => {
  try {
    const { visibility, importance, status } = req.query;
    
    // Build the SQL query with filters
    let sql = `
      SELECT 
        a.id,
        a.title,
        a.description,
        a.form_link,
        a.publication_date,
        a.expiry_date,
        a.visibility,
        a.importance,
        a.status,
        admin.username as created_by
      FROM announcements a
      JOIN admin ON a.admin_id = admin.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    
    // Add filters if provided
    if (status) {
      sql += ' AND a.status = ?';
      queryParams.push(status);
    } else {
      sql += ' AND a.status = "active"';
    }
    
    // Handle comma-separated visibility values (like 'Students,All')
    if (visibility && visibility !== 'all') {
      // Split by comma and create IN clause
      const visibilityValues = visibility.split(',');
      if (visibilityValues.length > 0) {
        sql += ' AND a.visibility IN (?)'; 
        queryParams.push(visibilityValues);
      }
    }
    
    if (importance && importance !== 'all') {
      sql += ' AND a.importance = ?';
      queryParams.push(importance);
    }
    
    sql += ' ORDER BY a.publication_date DESC';
    
    const [announcements] = await db.query(sql, queryParams);
    console.log(`Found ${announcements.length} announcements`);
    res.status(200).json(announcements);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

// Get a specific announcement
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        a.*,
        admin.username as created_by
      FROM announcements a
      JOIN admin ON a.admin_id = admin.id
      WHERE a.id = ? AND a.status = 'active'
    `, [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Announcement not found' });
    }
    
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Error fetching announcement:', error);
    res.status(500).json({ error: 'Failed to fetch announcement' });
  }
});

// Create a new announcement
router.post('/', async (req, res) => {
  try {
    const { 
      title,
      description,
      form_link,
      expiry_date,
      visibility,
      importance,
      admin_id // Get admin_id from request body
    } = req.body;
    
    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({ 
        error: 'Title and description are required' 
      });
    }

    // Validate enum values against schema
    const validImportanceValues = ['Normal', 'Important', 'Urgent'];
    const validVisibilityValues = ['All', 'Faculty', 'Students'];
    
    if (importance && !validImportanceValues.includes(importance)) {
      return res.status(400).json({
        error: `Importance must be one of: ${validImportanceValues.join(', ')}`
      });
    }
    
    if (visibility && !validVisibilityValues.includes(visibility)) {
      return res.status(400).json({
        error: `Visibility must be one of: ${validVisibilityValues.join(', ')}`
      });
    }

    // Use the admin_id from request body, or fallback to session if available
    const actualAdminId = admin_id || req.session?.admin?.id || 1;

    // Insert the announcement
    const [result] = await db.query(
      `INSERT INTO announcements (
        title,
        description,
        form_link,
        publication_date,
        expiry_date,
        admin_id,
        visibility,
        importance,
        status
      ) VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, 'active')`,
      [
        title,
        description,
        form_link || null,
        expiry_date || null,
        actualAdminId,
        visibility || 'All',
        importance || 'Normal'
      ]
    );
    
    const newAnnouncementId = result.insertId;
    
    // Fetch the newly created announcement
    const [rows] = await db.query(`
      SELECT 
        a.*,
        admin.username as created_by
      FROM announcements a
      JOIN admin ON a.admin_id = admin.id
      WHERE a.id = ?
    `, [newAnnouncementId]);
    
    console.log('Successfully created announcement with ID:', newAnnouncementId);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ error: 'Failed to create announcement' });
  }
});

// Update an announcement
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title,
      description,
      form_link,
      expiry_date,
      visibility,
      importance,
      status
    } = req.body;
    
    // Validate required fields
    if (!title && !description && !visibility && !importance && !status && form_link === undefined && expiry_date === undefined) {
      return res.status(400).json({ 
        error: 'At least one field must be provided to update' 
      });
    }

    // Validate enum values against schema
    if (importance) {
      const validImportanceValues = ['Normal', 'Important', 'Urgent'];
      if (!validImportanceValues.includes(importance)) {
        return res.status(400).json({
          error: `Importance must be one of: ${validImportanceValues.join(', ')}`
        });
      }
    }
    
    if (visibility) {
      const validVisibilityValues = ['All', 'Faculty', 'Students'];
      if (!validVisibilityValues.includes(visibility)) {
        return res.status(400).json({
          error: `Visibility must be one of: ${validVisibilityValues.join(', ')}`
        });
      }
    }
    
    if (status) {
      const validStatusValues = ['active', 'inactive'];
      if (!validStatusValues.includes(status)) {
        return res.status(400).json({
          error: `Status must be one of: ${validStatusValues.join(', ')}`
        });
      }
    }
    
    // Build update query dynamically
    let updateFields = [];
    let queryParams = [];

    if (title !== undefined) {
      updateFields.push('title = ?');
      queryParams.push(title);
    }
    
    if (description !== undefined) {
      updateFields.push('description = ?');
      queryParams.push(description);
    }
    
    if (form_link !== undefined) {
      updateFields.push('form_link = ?');
      queryParams.push(form_link);
    }
    
    if (expiry_date !== undefined) {
      updateFields.push('expiry_date = ?');
      queryParams.push(expiry_date);
    }
    
    if (visibility !== undefined) {
      updateFields.push('visibility = ?');
      queryParams.push(visibility);
    }
    
    if (importance !== undefined) {
      updateFields.push('importance = ?');
      queryParams.push(importance);
    }
    
    if (status !== undefined) {
      updateFields.push('status = ?');
      queryParams.push(status);
    }
    
    // Add the ID to params
    queryParams.push(id);

    // Execute update query
    const [result] = await db.query(
      `UPDATE announcements SET ${updateFields.join(', ')} WHERE id = ?`,
      queryParams
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Announcement not found' });
    }
    
    // Fetch the updated announcement
    const [rows] = await db.query(`
      SELECT 
        a.*,
        admin.username as created_by
      FROM announcements a
      JOIN admin ON a.admin_id = admin.id
      WHERE a.id = ?
    `, [id]);
    
    console.log('Successfully updated announcement with ID:', id);
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(500).json({ error: 'Failed to update announcement' });
  }
});

// Delete an announcement (soft delete by updating status)
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('UPDATE announcements SET status = "inactive" WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Announcement not found' });
    }
    
    res.status(200).json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({ error: 'Failed to delete announcement' });
  }
});

export default router;