
const Provider = require('../models/Provider');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// الحصول على جميع مزودي الخدمة
exports.getAllProviders = catchAsync(async (req, res, next) => {
  const providers = await Provider.find().populate('countries');
  
  res.status(200).json({
    status: 'success',
    results: providers.length,
    data: providers
  });
});

// الحصول على مزود خدمة بواسطة المعرف
exports.getProvider = catchAsync(async (req, res, next) => {
  const provider = await Provider.findById(req.params.id).populate('countries');
  
  if (!provider) {
    return next(new AppError('لم يتم العثور على مزود خدمة بهذا المعرف', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: provider
  });
});

// إنشاء مزود خدمة جديد
exports.createProvider = catchAsync(async (req, res, next) => {
  const newProvider = await Provider.create(req.body);
  
  res.status(201).json({
    status: 'success',
    data: newProvider
  });
});

// تحديث مزود خدمة
exports.updateProvider = catchAsync(async (req, res, next) => {
  const provider = await Provider.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );
  
  if (!provider) {
    return next(new AppError('لم يتم العثور على مزود خدمة بهذا المعرف', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: provider
  });
});

// حذف مزود خدمة
exports.deleteProvider = catchAsync(async (req, res, next) => {
  const provider = await Provider.findByIdAndDelete(req.params.id);
  
  if (!provider) {
    return next(new AppError('لم يتم العثور على مزود خدمة بهذا المعرف', 404));
  }
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});
