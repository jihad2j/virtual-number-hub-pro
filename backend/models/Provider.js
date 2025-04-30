
const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'اسم المزود مطلوب'],
    trim: true
  },
  logo: {
    type: String
  },
  description: {
    type: String
  },
  countries: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Country'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  apiKey: {
    type: String,
    select: false
  },
  apiUrl: {
    type: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const Provider = mongoose.model('Provider', providerSchema);
module.exports = Provider;
