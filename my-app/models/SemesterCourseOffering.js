import mongoose from 'mongoose';

const semesterCourseOfferingSchema = new mongoose.Schema({
  academic_year_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicYear',
    required: true
  },
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  faculty_id: {
    type: String, // String to match faculty id style
    required: true
  },
  available_seats: {
    type: Number,
    default: 0
  },
  total_seats: {
    type: Number,
    required: true
  }
}, { timestamps: true });

const SemesterCourseOffering = mongoose.model('SemesterCourseOffering', semesterCourseOfferingSchema);
export default SemesterCourseOffering;
