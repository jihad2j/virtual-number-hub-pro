
const UserApplication = require('../models/UserApplication');
const Application = require('../models/Application');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// الحصول على جميع التطبيقات الأساسية (للمشرفين)
exports.getAllApplications = catchAsync(async (req, res, next) => {
  const applications = await Application.find();
  
  res.status(200).json({
    status: 'success',
    results: applications.length,
    data: applications
  });
});

// إضافة تطبيق أساسي جديد
exports.addBaseApplication = catchAsync(async (req, res, next) => {
  const { name, description } = req.body;
  
  if (!name) {
    return next(new AppError('اسم التطبيق مطلوب', 400));
  }
  
  // التحقق من عدم وجود تطبيق بنفس الاسم
  const existingApp = await Application.findOne({ name });
  
  if (existingApp) {
    return next(new AppError('تطبيق بهذا الاسم موجود بالفعل', 400));
  }
  
  const newApplication = await Application.create({
    name,
    description
  });
  
  res.status(201).json({
    status: 'success',
    data: newApplication
  });
});

// تحديث تطبيق أساسي
exports.updateBaseApplication = catchAsync(async (req, res, next) => {
  const application = await Application.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );
  
  if (!application) {
    return next(new AppError('لم يتم العثور على التطبيق المحدد', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: application
  });
});

// حذف تطبيق أساسي
exports.deleteBaseApplication = catchAsync(async (req, res, next) => {
  const application = await Application.findByIdAndDelete(req.params.id);
  
  if (!application) {
    return next(new AppError('لم يتم العثور على التطبيق المحدد', 404));
  }
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

// الحصول على التطبيقات المتاحة للمستخدمين
exports.getUserApplications = catchAsync(async (req, res, next) => {
  const applications = await UserApplication.find({ isAvailable: true });
  
  res.status(200).json({
    status: 'success',
    results: applications.length,
    data: applications
  });
});

// إضافة تطبيق جديد للمستخدمين
exports.addUserApplication = catchAsync(async (req, res, next) => {
  const { providerName, countryName, applicationName, serverName, price } = req.body;
  
  if (!providerName || !countryName || !applicationName || !serverName || !price) {
    return next(new AppError('جميع الحقول مطلوبة', 400));
  }
  
  // التحقق من عدم وجود تطبيق مكرر
  const existingApp = await UserApplication.findOne({
    name: applicationName,
    providerName,
    countryName,
    serverName
  });
  
  if (existingApp) {
    return next(new AppError('هذا التطبيق موجود بالفعل بنفس الإعدادات', 400));
  }
  
  const newApplication = await UserApplication.create({
    name: applicationName,
    providerName,
    countryName,
    serverName,
    price,
    isAvailable: true,
    description: `تطبيق ${applicationName} من مزود ${providerName} في ${countryName}`
  });
  
  res.status(201).json({
    status: 'success',
    data: newApplication
  });
});

// تحديث تطبيق مستخدم
exports.updateUserApplication = catchAsync(async (req, res, next) => {
  const application = await UserApplication.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );
  
  if (!application) {
    return next(new AppError('لم يتم العثور على التطبيق المحدد', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: application
  });
});

// حذف تطبيق مستخدم
exports.deleteUserApplication = catchAsync(async (req, res, next) => {
  const application = await UserApplication.findByIdAndDelete(req.params.id);
  
  if (!application) {
    return next(new AppError('لم يتم العثور على التطبيق المحدد', 404));
  }
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

// شراء تطبيق
exports.purchaseApplication = catchAsync(async (req, res, next) => {
  const { applicationId } = req.body;
  const userId = req.user.id;
  
  // البحث عن التطبيق
  const application = await UserApplication.findById(applicationId);
  
  if (!application) {
    return next(new AppError('لم يتم العثور على التطبيق المحدد', 404));
  }
  
  if (!application.isAvailable) {
    return next(new AppError('هذا التطبيق غير متاح حالياً', 400));
  }
  
  // البحث عن المستخدم
  const user = await User.findById(userId);
  
  if (!user) {
    return next(new AppError('لم يتم العثور على المستخدم', 404));
  }
  
  // التحقق من الرصيد
  if (user.balance < application.price) {
    return next(new AppError('رصيدك غير كافي لشراء هذا التطبيق', 400));
  }
  
  // خصم المبلغ من رصيد المستخدم
  user.balance -= application.price;
  await user.save();
  
  // إنشاء معاملة
  await Transaction.create({
    userId,
    amount: -application.price,
    type: 'purchase',
    status: 'completed',
    description: `شراء تطبيق ${application.name}`
  });
  
  res.status(200).json({
    status: 'success',
    message: 'تم شراء التطبيق بنجاح',
    data: {
      application,
      newBalance: user.balance
    }
  });
});
