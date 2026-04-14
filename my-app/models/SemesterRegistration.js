import mongoose from 'mongoose';

const semesterRegistrationSchema = new mongoose.Schema({
  student_id: {
    type: String,
    required: true
  },
  semester: {
    type: Number,
    required: true
  },
  academic_year_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicYear',
    required: true
  },
  registration_date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['In Progress', 'Submitted', 'Approved', 'Rejected'],
    default: 'In Progress'
  }
}, { timestamps: true });

const SemesterRegistration = mongoose.model('SemesterRegistration', semesterRegistrationSchema);
export default SemesterRegistration;
