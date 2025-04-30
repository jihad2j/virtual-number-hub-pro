
const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'اسم المزود مطلوب'],
    trim: true
  },
  code: {
    type: String,
    required: [true, 'رمز المزود مطلوب'],
    trim: true,
    unique: true
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
  },
  endpoints: {
    balance: {
      type: String,
      default: '/balance'
    },
    countries: {
      type: String,
      default: '/countries'
    },
    products: {
      type: String,
      default: '/products'
    },
    purchase: {
      type: String,
      default: '/purchase'
    },
    status: {
      type: String,
      default: '/status'
    },
    cancel: {
      type: String,
      default: '/cancel'
    }
  },
  settings: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const Provider = mongoose.model('Provider', providerSchema);
module.exports = Provider;
