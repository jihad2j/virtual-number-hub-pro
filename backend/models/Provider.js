
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
  },
  type: {
    type: String,
    enum: ['5sim', 'smsactivate', 'getsms', 'smsman', 'onlinesim', 'other'],
    default: 'other'
  },
  config: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
    select: false // لا يتم إرجاع الإعدادات في الاستعلامات العادية
  },
  settings: {
    requestTimeout: {
      type: Number,
      default: 60000 // 60 seconds default timeout
    },
    autoRetry: {
      type: Boolean,
      default: false
    },
    maxRetries: {
      type: Number, 
      default: 3
    },
    preferredCountries: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Country'
    }],
    defaultMarkup: {
      type: Number,
      default: 10 // 10% markup by default
    },
    customEndpoints: {
      balance: {
        type: String,
        default: ''
      },
      countries: {
        type: String,
        default: ''
      },
      services: {
        type: String,
        default: ''
      },
      purchase: {
        type: String,
        default: ''
      },
      status: {
        type: String,
        default: ''
      }
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// تحويل _id إلى id لسهولة الاستخدام في الواجهة
providerSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

const Provider = mongoose.model('Provider', providerSchema);
module.exports = Provider;
