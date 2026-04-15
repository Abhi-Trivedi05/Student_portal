const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    resetToken: { type: String }, // Token for password reset
    resetExpires: { type: Date } // Expiry date for reset token
});

module.exports = mongoose.model('Student', studentSchema);