
const mongoose = require('mongoose');

const prepaidCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'كود الشحن مطلوب'],
    unique: true
  },
  amount: {
    type: Number,
    required: [true, 'قيمة كود الشحن مطلوبة'],
    min: [1, 'قيمة كود الشحن يجب أن تكون موجبة']
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  usedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  usedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// افتراضي لتحميل اسم المستخدم الذي استخدم الكود
prepaidCodeSchema.virtual('usedByUsername').get(function() {
  if (this.populated('usedBy')) {
    return this.usedBy.username;
  }
  return null;
});

const PrepaidCode = mongoose.model('PrepaidCode', prepaidCodeSchema);
module.exports = PrepaidCode;
