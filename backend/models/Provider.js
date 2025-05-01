
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
    unique: true,
    enum: ['5sim', 'smsactivate', 'getsmscode', 'smsman', 'onlinesims']
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
  isDefault: {
    type: Boolean,
    default: false
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
  },
  rateLimit: {
    requestsPerMinute: {
      type: Number,
      default: 60
    }
  },
  stats: {
    successRate: {
      type: Number,
      default: 0
    },
    totalRequests: {
      type: Number,
      default: 0
    },
    lastCheck: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ضمان مزود افتراضي واحد فقط
providerSchema.pre('save', async function(next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    );
  }
  next();
});

const Provider = mongoose.model('Provider', providerSchema);
module.exports = Provider;
