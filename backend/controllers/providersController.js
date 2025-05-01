
const Provider = require('../models/Provider');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { ProviderFactory } = require('../services/providerFactory');

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
  // تأكد من وجود رمز فريد للمزود
  if (!req.body.code) {
    req.body.code = req.body.name.toLowerCase().replace(/\s+/g, '');
  }
  
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

// تحديث حالة تفعيل مزود خدمة
exports.toggleProviderStatus = catchAsync(async (req, res, next) => {
  const provider = await Provider.findById(req.params.id);
  
  if (!provider) {
    return next(new AppError('لم يتم العثور على مزود خدمة بهذا المعرف', 404));
  }
  
  provider.isActive = !provider.isActive;
  await provider.save();
  
  res.status(200).json({
    status: 'success',
    data: provider
  });
});

// تعيين المزود الافتراضي
exports.setDefaultProvider = catchAsync(async (req, res, next) => {
  const provider = await Provider.findById(req.params.id);
  
  if (!provider) {
    return next(new AppError('لم يتم العثور على مزود خدمة بهذا المعرف', 404));
  }
  
  // تعيين جميع المزودين كغير افتراضيين
  await Provider.updateMany({}, { isDefault: false });
  
  // تعيين المزود المحدد كافتراضي
  provider.isDefault = true;
  await provider.save();
  
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

// اختبار الاتصال بمزود خدمة
exports.testProviderConnection = catchAsync(async (req, res, next) => {
  // البحث عن المزود مع استرجاع apiKey (محمي عادة)
  const provider = await Provider.findById(req.params.id).select('+apiKey');
  
  if (!provider) {
    return next(new AppError('لم يتم العثور على مزود خدمة بهذا المعرف', 404));
  }
  
  // إنشاء كائن المزود المناسب باستخدام مصنع المزودين
  const providerService = ProviderFactory.createProvider(provider);
  
  try {
    const connectionResult = await providerService.testConnection();
    
    res.status(200).json({
      status: 'success',
      connected: connectionResult
    });
  } catch (error) {
    res.status(200).json({
      status: 'success',
      connected: false,
      message: error.message
    });
  }
});

// جلب رصيد مزود الخدمة
exports.getProviderBalance = catchAsync(async (req, res, next) => {
  // البحث عن المزود مع استرجاع apiKey (محمي عادة)
  const provider = await Provider.findById(req.params.id).select('+apiKey');
  
  if (!provider) {
    return next(new AppError('لم يتم العثور على مزود خدمة بهذا المعرف', 404));
  }
  
  // إنشاء كائن المزود المناسب باستخدام مصنع المزودين
  const providerService = ProviderFactory.createProvider(provider);
  
  try {
    const balance = await providerService.getBalance();
    
    res.status(200).json({
      status: 'success',
      data: balance
    });
  } catch (error) {
    return next(new AppError(`فشل في جلب رصيد المزود: ${error.message}`, 400));
  }
});

// جلب الدول المتاحة من مزود الخدمة
exports.getProviderCountries = catchAsync(async (req, res, next) => {
  // البحث عن المزود مع استرجاع apiKey (محمي عادة)
  const provider = await Provider.findById(req.params.id).select('+apiKey');
  
  if (!provider) {
    return next(new AppError('لم يتم العثور على مزود خدمة بهذا المعرف', 404));
  }
  
  // إنشاء كائن المزود المناسب باستخدام مصنع المزودين
  const providerService = ProviderFactory.createProvider(provider);
  
  try {
    const countries = await providerService.getCountries();
    
    res.status(200).json({
      status: 'success',
      results: countries.length,
      data: countries
    });
  } catch (error) {
    return next(new AppError(`فشل في جلب الدول المتاحة: ${error.message}`, 400));
  }
});

// جلب الخدمات المتاحة لدولة معينة من مزود الخدمة
exports.getProviderServices = catchAsync(async (req, res, next) => {
  // البحث عن المزود مع استرجاع apiKey (محمي عادة)
  const provider = await Provider.findById(req.params.id).select('+apiKey');
  
  if (!provider) {
    return next(new AppError('لم يتم العثور على مزود خدمة بهذا المعرف', 404));
  }
  
  const { countryCode } = req.params;
  
  // إنشاء كائن المزود المناسب باستخدام مصنع المزودين
  const providerService = ProviderFactory.createProvider(provider);
  
  try {
    const services = await providerService.getServices(countryCode);
    
    res.status(200).json({
      status: 'success',
      results: services.length,
      data: services
    });
  } catch (error) {
    return next(new AppError(`فشل في جلب الخدمات المتاحة: ${error.message}`, 400));
  }
});

// وظائف إضافية لإدارة المزودين
exports.getAvailableProviders = catchAsync(async (req, res, next) => {
  const providers = await Provider.find({ isActive: true }).select('name code logo');
  
  res.status(200).json({
    status: 'success',
    results: providers.length,
    data: providers
  });
});

// جلب رصيد جميع المزودين النشطين
exports.getAllProvidersBalance = catchAsync(async (req, res, next) => {
  const providers = await Provider.find({ isActive: true }).select('+apiKey');
  
  const results = [];
  
  for (const provider of providers) {
    try {
      const providerService = ProviderFactory.createProvider(provider);
      const balance = await providerService.getBalance();
      
      results.push({
        id: provider._id,
        name: provider.name,
        code: provider.code,
        balance: balance
      });
    } catch (error) {
      results.push({
        id: provider._id,
        name: provider.name,
        code: provider.code,
        error: error.message
      });
    }
  }
  
  res.status(200).json({
    status: 'success',
    results: results.length,
    data: results
  });
});

// وظائف إضافية لشراء وإدارة الأرقام
exports.purchaseNumber = catchAsync(async (req, res, next) => {
  const { providerId, countryCode, service } = req.body;
  
  // البحث عن المزود مع استرجاع apiKey (محمي عادة)
  const provider = await Provider.findById(providerId).select('+apiKey');
  
  if (!provider) {
    return next(new AppError('لم يتم العثور على مزود خدمة بهذا المعرف', 404));
  }
  
  // إنشاء كائن المزود المناسب باستخدام مصنع المزودين
  const providerService = ProviderFactory.createProvider(provider);
  
  try {
    const purchaseData = await providerService.purchaseNumber({
      countryCode,
      service
    });
    
    // هنا يمكن تسجيل عملية الشراء في قاعدة البيانات
    
    res.status(200).json({
      status: 'success',
      data: purchaseData
    });
  } catch (error) {
    return next(new AppError(`فشل في شراء الرقم: ${error.message}`, 400));
  }
});

exports.checkNumberStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { providerId } = req.query;
  
  // البحث عن المزود مع استرجاع apiKey (محمي عادة)
  const provider = await Provider.findById(providerId).select('+apiKey');
  
  if (!provider) {
    return next(new AppError('لم يتم العثور على مزود خدمة بهذا المعرف', 404));
  }
  
  // إنشاء كائن المزود المناسب باستخدام مصنع المزودين
  const providerService = ProviderFactory.createProvider(provider);
  
  try {
    const numberStatus = await providerService.checkNumber(id);
    
    res.status(200).json({
      status: 'success',
      data: numberStatus
    });
  } catch (error) {
    return next(new AppError(`فشل في التحقق من حالة الرقم: ${error.message}`, 400));
  }
});

exports.cancelNumber = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { providerId } = req.body;
  
  // البحث عن المزود مع استرجاع apiKey (محمي عادة)
  const provider = await Provider.findById(providerId).select('+apiKey');
  
  if (!provider) {
    return next(new AppError('لم يتم العثور على مزود خدمة بهذا المعرف', 404));
  }
  
  // إنشاء كائن المزود المناسب باستخدام مصنع المزودين
  const providerService = ProviderFactory.createProvider(provider);
  
  try {
    const cancelResult = await providerService.cancelNumber(id);
    
    res.status(200).json({
      status: 'success',
      success: cancelResult
    });
  } catch (error) {
    return next(new AppError(`فشل في إلغاء الرقم: ${error.message}`, 400));
  }
});
