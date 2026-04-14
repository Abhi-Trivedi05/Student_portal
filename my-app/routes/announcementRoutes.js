import express from 'express';
import Announcement from '../models/Announcement.js';
import Admin from '../models/Admin.js';

const router = express.Router();

// Get all announcements with optional filters
// In your announcements.js router file, update the GET route:

// Get all announcements with optional filters
router.get('/', async (req, res) => {
  try {
    const { visibility, importance, status } = req.query;
    
    // Build the Mongoose query
    let query = { status: status || 'active' };
    
    if (visibility && visibility !== 'all') {
      const visibilityValues = visibility.split(',');
      query.visibility = { $in: visibilityValues };
    }
    
    if (importance && importance !== 'all') {
      query.importance = importance;
    }
    
    const announcements = await Announcement.find(query)
      .populate('admin_id', 'username')
      .sort({ publication_date: -1 });

    const formattedAnnouncements = announcements.map(a => ({
        ...a._doc,
        id: a._id,
        created_by: a.admin_id ? a.admin_id.username : 'Unknown'
    }));

    console.log(`Found ${formattedAnnouncements.length} announcements`);
    res.status(200).json(formattedAnnouncements);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

// Get a specific announcement
router.get('/:id', async (req, res) => {
  try {
    const announcement = await Announcement.findOne({ 
        _id: req.params.id, 
        status: 'active' 
    }).populate('admin_id', 'username');
    
    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }
    
    const result = {
        ...announcement._doc,
        id: announcement._id,
        created_by: announcement.admin_id ? announcement.admin_id.username : 'Unknown'
    };

    res.status(200).json(result);
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
      admin_id 
    } = req.body;
    
    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({ 
        error: 'Title and description are required' 
      });
    }

    const actualAdminId = admin_id || req.session?.admin?.id || null;

    const newAnnouncement = await Announcement.create({
        title,
        description,
        form_link,
        expiry_date,
        visibility: visibility || 'All',
        importance: importance || 'Normal',
        admin_id: actualAdminId,
        status: 'active',
        publication_date: new Date()
    });

    const populatedAnnouncement = await Announcement.findById(newAnnouncement._id)
        .populate('admin_id', 'username');

    const result = {
        ...populatedAnnouncement._doc,
        id: populatedAnnouncement._id,
        created_by: populatedAnnouncement.admin_id ? populatedAnnouncement.admin_id.username : 'Unknown'
    };

    console.log('Successfully created announcement with ID:', newAnnouncement._id);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ error: 'Failed to create announcement: ' + error.message });
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
    
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (form_link !== undefined) updateData.form_link = form_link;
    if (expiry_date !== undefined) updateData.expiry_date = expiry_date;
    if (visibility !== undefined) updateData.visibility = visibility;
    if (importance !== undefined) updateData.importance = importance;
    if (status !== undefined) updateData.status = status;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ 
        error: 'At least one field must be provided to update' 
      });
    }

    const announcement = await Announcement.findByIdAndUpdate(id, updateData, { new: true })
        .populate('admin_id', 'username');
    
    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }
    
    const result = {
        ...announcement._doc,
        id: announcement._id,
        created_by: announcement.admin_id ? announcement.admin_id.username : 'Unknown'
    };

    console.log('Successfully updated announcement with ID:', id);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(500).json({ error: 'Failed to update announcement: ' + error.message });
  }
});

// Delete an announcement (soft delete by updating status)
router.delete('/:id', async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(req.params.id, { status: 'inactive' });
    
    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }
    
    res.status(200).json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({ error: 'Failed to delete announcement' });
  }
});

export default router;