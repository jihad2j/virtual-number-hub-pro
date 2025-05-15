
const mongoose = require('mongoose');

const phoneNumberSchema = new mongoose.Schema({
  number: {
    type: String,
    required: [true, 'رقم الهاتف مطلوب'],
    trim: true
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider',
    required: [true, 'مزود الخدمة مطلوب']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  countryCode: {
    type: String,
    required: [true, 'رمز الدولة مطلوب']
  },
  countryName: String,
  countryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Country'
  },
  service: {
    type: String,
    required: [true, 'الخدمة مطلوبة']
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled', 'expired'],
    default: 'active'
  },
  providerNumberId: String,
  price: {
    type: Number,
    default: 0
  },
  smsCode: String,
  expiresAt: {
    type: Date,
    required: [true, 'تاريخ انتهاء الصلاحية مطلوب']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const PhoneNumber = mongoose.model('PhoneNumber', phoneNumberSchema);
module.exports = PhoneNumber;
