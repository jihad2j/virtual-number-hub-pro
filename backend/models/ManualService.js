
const mongoose = require('mongoose');

const manualServiceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'اسم الخدمة مطلوب'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'وصف الخدمة مطلوب']
  },
  price: {
    type: Number,
    required: [true, 'سعر الخدمة مطلوب'],
    min: 0
  },
  image: {
    type: String
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

const ManualService = mongoose.model('ManualService', manualServiceSchema);
module.exports = ManualService;
