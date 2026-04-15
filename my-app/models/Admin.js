const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    // Existing fields
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    resetToken: { type: String }, // Added for password reset
    resetExpires: { type: Date } // Added for password reset
});

module.exports = mongoose.model('Admin', adminSchema);