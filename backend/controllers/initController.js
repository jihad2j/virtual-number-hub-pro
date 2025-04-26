
const User = require('../models/User');
const Country = require('../models/Country');
const Provider = require('../models/Provider');
const ManualService = require('../models/ManualService');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { ObjectId } = require('mongodb');

// Initialize default data
exports.initData = catchAsync(async (req, res, next) => {
  // Check if we already have data
  const userCount = await User.countDocuments();
  
  if (userCount === 0) {
    // Create default admin user
    const admin = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
      balance: 1000,
      isActive: true
    });
    
    // Create default user
    const user = await User.create({
      username: 'user',
      email: 'user@example.com',
      password: 'user123',
      role: 'user',
      balance: 100,
      isActive: true
    });
    
    // Create default countries
    const countries = await Country.insertMany([
      {
        name: 'Saudi Arabia',
        code: 'sa',
        flag: '🇸🇦',
        available: true
      },
      {
        name: 'United Arab Emirates',
        code: 'ae',
        flag: '🇦🇪',
        available: true
      },
      {
        name: 'Egypt',
        code: 'eg',
        flag: '🇪🇬',
        available: true
      }
    ]);
    
    // Create default providers
    const providers = await Provider.insertMany([
      {
        name: '5sim',
        description: 'مزود خدمة أرقام افتراضية',
        countries: [countries[0]._id, countries[1]._id],
        isActive: true
      },
      {
        name: 'SMS Activate',
        description: 'مزود خدمة أرقام افتراضية',
        countries: [countries[0]._id, countries[2]._id],
        isActive: true
      }
    ]);
    
    // Create default manual services
    await ManualService.insertMany([
      {
        name: 'تفعيل واتساب',
        description: 'تفعيل رقم واتساب جديد',
        price: 5,
        available: true
      },
      {
        name: 'تفعيل تلغرام',
        description: 'تفعيل حساب تلغرام جديد',
        price: 3,
        available: true
      },
      {
        name: 'تفعيل فيسبوك',
        description: 'تفعيل حساب فيسبوك جديد',
        price: 7,
        available: true
      }
    ]);
    
    res.status(200).json({
      status: 'success',
      message: 'تم تهيئة البيانات الافتراضية بنجاح',
      data: {
        users: [admin, user],
        countries,
        providers
      }
    });
  } else {
    res.status(200).json({
      status: 'success',
      message: 'البيانات موجودة بالفعل'
    });
  }
});
