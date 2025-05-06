
const mongoose = require('mongoose');

const productVisibilitySchema = new mongoose.Schema({
  productId: {
    type: String,
    required: [true, 'معرف المنتج مطلوب'],
    trim: true
  },
  productName: {
    type: String,
    trim: true
  },
  countryId: {
    type: String,
    required: [true, 'معرف الدولة مطلوب'],
    trim: true
  },
  countryName: {
    type: String,
    trim: true
  },
  providerId: {
    type: String,
    required: [true, 'معرف المزود مطلوب'],
    trim: true
  },
  providerName: {
    type: String,
    trim: true
  },
  originalPrice: {
    type: Number,
    default: 0
  },
  displayPrice: {
    type: Number,
    required: [true, 'سعر العرض مطلوب'],
    min: [0, 'لا يمكن أن يكون السعر سالبًا']
  },
  isVisible: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create a compound index to ensure unique product visibility settings
productVisibilitySchema.index({ productId: 1, countryId: 1, providerId: 1 }, { unique: true });

const ProductVisibility = mongoose.model('ProductVisibility', productVisibilitySchema);
module.exports = ProductVisibility;
