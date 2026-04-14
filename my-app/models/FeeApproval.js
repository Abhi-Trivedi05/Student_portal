import mongoose from 'mongoose';

const feeApprovalSchema = new mongoose.Schema({
  fee_transaction_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FeeTransaction',
    required: true
  },
  admin_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
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

const FeeApproval = mongoose.model('FeeApproval', feeApprovalSchema);
export default FeeApproval;
