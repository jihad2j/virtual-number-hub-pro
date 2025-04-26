
const ManualService = require('../models/ManualService');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// الحصول على جميع خدمات التفعيل اليدوي
exports.getAllManualServices = catchAsync(async (req, res, next) => {
  const services = await ManualService.find();
  
  res.status(200).json({
    status: 'success',
    results: services.length,
    data: services
  });
});

// الحصول على خدمة التفعيل اليدوي بواسطة المعرف
exports.getManualService = catchAsync(async (req, res, next) => {
  const service = await ManualService.findById(req.params.id);
  
  if (!service) {
    return next(new AppError('لم يتم العثور على خدمة بهذا المعرف', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: service
  });
});

// إنشاء خدمة تفعيل يدوي جديدة
exports.createManualService = catchAsync(async (req, res, next) => {
  const newService = await ManualService.create(req.body);
  
  res.status(201).json({
    status: 'success',
    data: newService
  });
});

// تحديث خدمة تفعيل يدوي
exports.updateManualService = catchAsync(async (req, res, next) => {
  const service = await ManualService.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );
  
  if (!service) {
    return next(new AppError('لم يتم العثور على خدمة بهذا المعرف', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: service
  });
});

// حذف خدمة تفعيل يدوي
exports.deleteManualService = catchAsync(async (req, res, next) => {
  const service = await ManualService.findByIdAndDelete(req.params.id);
  
  if (!service) {
    return next(new AppError('لم يتم العثور على خدمة بهذا المعرف', 404));
  }
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});
