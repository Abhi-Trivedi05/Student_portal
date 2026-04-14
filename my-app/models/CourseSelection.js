import mongoose from 'mongoose';

const courseSelectionSchema = new mongoose.Schema({
  student_id: {
    type: String,
    required: true
  },
  offering_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SemesterCourseOffering',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, { timestamps: true });

const CourseSelection = mongoose.model('CourseSelection', courseSelectionSchema);
export default CourseSelection;
