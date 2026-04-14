import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  course_code: {
    type: String,
    required: true,
    unique: true
  },
  course_name: {
    type: String,
    required: true
  },
  credits: {
    type: Number,
    required: true
  },
  department: {
    type: String
  }
}, { timestamps: true });

const Course = mongoose.model('Course', courseSchema);
export default Course;
