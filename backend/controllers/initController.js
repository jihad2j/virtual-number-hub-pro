
const User = require('../models/User');
const ManualService = require('../models/ManualService');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// تهيئة البيانات الأساسية للنظام
exports.initData = catchAsync(async (req, res, next) => {
  try {
    // إنشاء مستخدم إداري افتراضي
    const adminUser = await User.findOne({ email: 'admin@admin.com' });
    if (!adminUser) {
      await User.create({
        username: 'admin',
        email: 'admin@admin.com',
        password: 'admin123',
        role: 'admin',
        balance: 1000,
        isActive: true
      });
      console.log('تم إنشاء المستخدم الإداري: admin@admin.com / admin123');
    }

    // إنشاء مستخدم تجريبي
    const testUser = await User.findOne({ email: 'user@user.com' });
    if (!testUser) {
      await User.create({
        username: 'testuser',
        email: 'user@user.com',
        password: 'user123',
        role: 'user',
        balance: 50,
        isActive: true
      });
      console.log('تم إنشاء المستخدم التجريبي: user@user.com / user123');
    }

    // إنشاء خدمات التفعيل اليدوي الافتراضية
    const servicesCount = await ManualService.countDocuments();
    if (servicesCount === 0) {
      const defaultServices = [
        {
          name: 'تفعيل حساب WhatsApp',
          description: 'خدمة تفعيل رقم WhatsApp يدوياً خلال 24 ساعة',
          price: 5,
          available: true
        },
        {
          name: 'تفعيل حساب Telegram',
          description: 'خدمة تفعيل رقم Telegram يدوياً خلال 12 ساعة',
          price: 3,
          available: true
        },
        {
          name: 'تفعيل حساب Instagram',
          description: 'خدمة تفعيل رقم Instagram يدوياً خلال 48 ساعة',
          price: 8,
          available: true
        },
        {
          name: 'تفعيل حساب Facebook',
          description: 'خدمة تفعيل رقم Facebook يدوياً خلال 24 ساعة',
          price: 6,
          available: true
        },
        {
          name: 'تفعيل حساب Twitter',
          description: 'خدمة تفعيل رقم Twitter يدوياً خلال 12 ساعة',
          price: 4,
          available: true
        }
      ];

      await ManualService.insertMany(defaultServices);
      console.log('تم إنشاء الخدمات اليدوية الافتراضية');
    }

    res.status(200).json({
      status: 'success',
      message: 'تم تهيئة النظام بنجاح'
    });

  } catch (error) {
    console.error('خطأ في تهيئة النظام:', error);
    return next(new AppError('فشل في تهيئة النظام', 500));
  }
});

// إنشاء المستخدم الإداري
exports.createAdmin = catchAsync(async (req, res, next) => {
  const existingAdmin = await User.findOne({ role: 'admin' });
  
  if (existingAdmin) {
    return res.status(200).json({
      status: 'success',
      message: 'المستخدم الإداري موجود بالفعل',
      data: { email: existingAdmin.email }
    });
  }

  const admin = await User.create({
    username: 'admin',
    email: 'admin@admin.com',
    password: 'admin123',
    role: 'admin',
    balance: 1000,
    isActive: true
  });

  res.status(201).json({
    status: 'success',
    message: 'تم إنشاء المستخدم الإداري بنجاح',
    data: { email: admin.email }
  });
});

// إضافة دالة getLocalData
exports.getLocalData = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'البيانات المحلية',
    data: {
      initialized: true,
      timestamp: new Date().toISOString()
    }
  });
});
