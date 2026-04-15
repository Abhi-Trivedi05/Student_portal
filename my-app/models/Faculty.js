// Faculty.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FacultySchema = new Schema({
    // existing fields ...
    resetToken: { type: String },
    resetExpires: { type: Date }
});

module.exports = mongoose.model('Faculty', FacultySchema);