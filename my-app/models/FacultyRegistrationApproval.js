import mongoose from 'mongoose';

const facultyRegistrationApprovalSchema = new mongoose.Schema({
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
  faculty_id: {
    type: String, // String to match faculty id style
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  remarks: {
    type: String
  },
  approval_date: {
    type: Date
  }
}, { timestamps: true });

const FacultyRegistrationApproval = mongoose.model('FacultyRegistrationApproval', facultyRegistrationApprovalSchema);
export default FacultyRegistrationApproval;
