import mongoose from 'mongoose';

const feeTransactionSchema = new mongoose.Schema({
  student_id: {
    type: String,
    required: true
  },
  academic_year_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicYear'
  },
  transaction_date: {
    type: Date,
    required: true
  },
  bank_name: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  reference_number: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed', 'Verified'],
    default: 'Pending'
  },
  semester: {
    type: Number
  }
}, { timestamps: true });

const FeeTransaction = mongoose.model('FeeTransaction', feeTransactionSchema);
export default FeeTransaction;
