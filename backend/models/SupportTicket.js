
const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
  message: {
    type: String,
    required: [true, 'الرسالة مطلوبة']
  },
  fromAdmin: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const supportTicketSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'المستخدم مطلوب']
  },
  subject: {
    type: String,
    required: [true, 'موضوع التذكرة مطلوب'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'الرسالة مطلوبة']
  },
  status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open'
  },
  responses: [responseSchema]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);
module.exports = SupportTicket;
