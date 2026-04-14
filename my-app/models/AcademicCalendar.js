import mongoose from 'mongoose';

const academicCalendarSchema = new mongoose.Schema({
  academic_year_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicYear',
    required: true
  },
  admin_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  file_name: {
    type: String,
    required: true
  },
  pdf_file: {
    type: Buffer,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, { timestamps: true });

const AcademicCalendar = mongoose.model('AcademicCalendar', academicCalendarSchema);
export default AcademicCalendar;
