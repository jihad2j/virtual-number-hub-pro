
const mongoose = require('mongoose');

const manualRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'المستخدم مطلوب']
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ManualService',
    required: [true, 'الخدمة مطلوبة']
  },
  serviceName: {
    type: String,
    required: [true, 'اسم الخدمة مطلوب']
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'cancelled'],
    default: 'pending'
  },
  notes: {
    type: String
  },
  adminResponse: {
    type: String
  },
  verificationCode: {
    type: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const ManualRequest = mongoose.model('ManualRequest', manualRequestSchema);
module.exports = ManualRequest;
