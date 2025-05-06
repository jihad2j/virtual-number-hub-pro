
const mongoose = require('mongoose');

const phoneNumberSchema = new mongoose.Schema({
  number: {
    type: String,
    required: [true, 'رقم الهاتف مطلوب'],
    trim: true
  },
  country: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Country',
    required: [true, 'الدولة مطلوبة']
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider',
    required: [true, 'مزود الخدمة مطلوب']
  },
  status: {
    type: String,
    enum: ['available', 'sold', 'expired'],
    default: 'available'
  },
  price: {
    type: Number,
    required: [true, 'سعر الرقم مطلوب'],
    min: 0
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  expiresAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const PhoneNumber = mongoose.model('PhoneNumber', phoneNumberSchema);
module.exports = PhoneNumber;
