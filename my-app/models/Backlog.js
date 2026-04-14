import mongoose from 'mongoose';

const backlogSchema = new mongoose.Schema({
  student_id: {
    type: String,
    required: true
  },
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Cleared'],
    default: 'Pending'
  },
  attempt_count: {
    type: Number,
    default: 1
  }
}, { timestamps: true });

const Backlog = mongoose.model('Backlog', backlogSchema);
export default Backlog;
