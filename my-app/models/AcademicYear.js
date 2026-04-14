import mongoose from 'mongoose';

const academicYearSchema = new mongoose.Schema({
  year_name: {
    type: String,
    required: true
  },
  start_date: {
    type: Date
  },
  end_date: {
    type: Date
  },
  is_current: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const AcademicYear = mongoose.model('AcademicYear', academicYearSchema);
export default AcademicYear;
