
const mongoose = require('mongoose');

const countrySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'اسم الدولة مطلوب'],
    trim: true
  },
  flag: {
    type: String,
    required: [true, 'علم الدولة مطلوب']
  },
  code: {
    type: String,
    required: [true, 'رمز الدولة مطلوب'],
    unique: true,
    lowercase: true,
    trim: true
  },
  available: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const Country = mongoose.model('Country', countrySchema);
module.exports = Country;
