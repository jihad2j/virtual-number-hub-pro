
const mongoose = require('mongoose');

const userApplicationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'اسم التطبيق مطلوب'],
    trim: true
  },
  providerName: {
    type: String,
    required: [true, 'اسم المزود مطلوب'],
    trim: true
  },
  countryName: {
    type: String,
    required: [true, 'اسم الدولة مطلوب'],
    trim: true
  },
  serverName: {
    type: String,
    required: [true, 'اسم السيرفر مطلوب'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'السعر مطلوب'],
    min: [0, 'السعر يجب أن يكون أكبر من أو يساوي صفر']
  },
  description: {
    type: String,
    trim: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// فهرس مركب لمنع التكرار
userApplicationSchema.index({ 
  name: 1, 
  providerName: 1, 
  countryName: 1, 
  serverName: 1 
}, { unique: true });

const UserApplication = mongoose.model('UserApplication', userApplicationSchema);
module.exports = UserApplication;
