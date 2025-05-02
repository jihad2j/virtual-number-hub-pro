const Country = require('../models/Country');
const Provider = require('../models/Provider');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// الحصول على جميع الدول
exports.getAllCountries = catchAsync(async (req, res, next) => {
  const countries = await Country.find();
  
  res.status(200).json({
    status: 'success',
    results: countries.length,
    data: countries
  });
});

// الحصول على الدول المتاحة فقط (مع التحقق من توفرها في مزودي الخدمة النشطين)
exports.getAvailableCountries = catchAsync(async (req, res, next) => {
  // Get all active providers
  const activeProviders = await Provider.find({ isActive: true });
  
  // Extract all country IDs from active providers
  const activeCountryIds = new Set();
  activeProviders.forEach(provider => {
    if (Array.isArray(provider.countries)) {
      provider.countries.forEach(countryId => {
        // Handle if countryId is an object or a string
        const id = typeof countryId === 'object' ? countryId.toString() : countryId;
        activeCountryIds.add(id);
      });
    }
  });
  
  // Find countries that are both available and associated with active providers
  const countries = await Country.find({ 
    available: true,
    _id: { $in: Array.from(activeCountryIds) }
  });
  
  res.status(200).json({
    status: 'success',
    results: countries.length,
    data: countries
  });
});

// الحصول على دولة بواسطة المعرف
exports.getCountry = catchAsync(async (req, res, next) => {
  const country = await Country.findById(req.params.id);
  
  if (!country) {
    return next(new AppError('لم يتم العثور على دولة بهذا المعرف', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: country
  });
});

// إنشاء دولة جديدة
exports.createCountry = catchAsync(async (req, res, next) => {
  const newCountry = await Country.create(req.body);
  
  res.status(201).json({
    status: 'success',
    data: newCountry
  });
});

// إنشاء عدة دول دفعة واحدة
exports.createBulkCountries = catchAsync(async (req, res, next) => {
  if (!req.body || !Array.isArray(req.body)) {
    return next(new AppError('يرجى توفير مصفوفة من الدول', 400));
  }
  
  const countries = await Country.insertMany(req.body);
  
  res.status(201).json({
    status: 'success',
    results: countries.length,
    data: countries
  });
});

// تحديث دولة
exports.updateCountry = catchAsync(async (req, res, next) => {
  const country = await Country.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );
  
  if (!country) {
    return next(new AppError('لم يتم العثور على دولة بهذا المعرف', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: country
  });
});

// حذف دولة
exports.deleteCountry = catchAsync(async (req, res, next) => {
  const country = await Country.findByIdAndDelete(req.params.id);
  
  if (!country) {
    return next(new AppError('لم يتم العثور على دولة بهذا المعرف', 404));
  }
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});
