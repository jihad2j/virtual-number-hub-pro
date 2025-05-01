
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'المستخدم مطلوب']
  },
  amount: {
    type: Number,
    required: [true, 'المبلغ مطلوب'],
  },
  type: {
    type: String,
    enum: ['deposit', 'purchase', 'gift_sent', 'gift_received', 'admin'],
    required: [true, 'نوع المعاملة مطلوب']
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  description: {
    type: String
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'paypal', 'bank', 'other'],
    default: 'other'
  },
  paymentDetails: {
    type: Object
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;
