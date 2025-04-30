
const Provider = require('../models/Provider');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const ProviderFactory = require('../services/providers/ProviderFactory');

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

// الحصول على رصيد مزود الخدمة
exports.getProviderBalance = catchAsync(async (req, res, next) => {
  const providerId = req.params.id;
  
  // البحث عن المزود في قاعدة البيانات مع تضمين البيانات السرية مثل مفتاح API
  const provider = await Provider.findById(providerId).select('+apiKey +config');
  
  if (!provider) {
    return next(new AppError('لم يتم العثور على مزود خدمة بهذا المعرف', 404));
  }
  
  if (!provider.isActive) {
    return next(new AppError('مزود الخدمة هذا غير نشط', 400));
  }
  
  try {
    // إنشاء كائن مزود الخدمة المناسب
    const providerService = ProviderFactory.createProvider(provider);
    
    // الحصول على الرصيد
    const balance = await providerService.getBalance();
    
    res.status(200).json({
      status: 'success',
      data: { 
        balance: balance.balance,
        currency: balance.currency
      }
    });
  } catch (error) {
    return next(new AppError(`فشل في الحصول على رصيد المزود: ${error.message}`, 500));
  }
});

// الحصول على دول مزود الخدمة
exports.getProviderCountries = catchAsync(async (req, res, next) => {
  const providerId = req.params.id;
  
  // البحث عن المزود في قاعدة البيانات مع تضمين البيانات السرية مثل مفتاح API
  const provider = await Provider.findById(providerId).select('+apiKey +config');
  
  if (!provider) {
    return next(new AppError('لم يتم العثور على مزود خدمة بهذا المعرف', 404));
  }
  
  if (!provider.isActive) {
    return next(new AppError('مزود الخدمة هذا غير نشط', 400));
  }
  
  try {
    // إنشاء كائن مزود الخدمة المناسب
    const providerService = ProviderFactory.createProvider(provider);
    
    // الحصول على الدول
    const countries = await providerService.getCountries();
    
    res.status(200).json({
      status: 'success',
      results: countries.length,
      data: countries
    });
  } catch (error) {
    return next(new AppError(`فشل في الحصول على دول المزود: ${error.message}`, 500));
  }
});

// الحصول على خدمات مزود الخدمة لدولة معينة
exports.getProviderServices = catchAsync(async (req, res, next) => {
  const { id, countryId } = req.params;
  
  // البحث عن المزود في قاعدة البيانات مع تضمين البيانات السرية مثل مفتاح API
  const provider = await Provider.findById(id).select('+apiKey +config');
  
  if (!provider) {
    return next(new AppError('لم يتم العثور على مزود خدمة بهذا المعرف', 404));
  }
  
  if (!provider.isActive) {
    return next(new AppError('مزود الخدمة هذا غير نشط', 400));
  }
  
  try {
    // إنشاء كائن مزود الخدمة المناسب
    const providerService = ProviderFactory.createProvider(provider);
    
    // الحصول على الخدمات
    const services = await providerService.getServices(countryId);
    
    res.status(200).json({
      status: 'success',
      data: services
    });
  } catch (error) {
    return next(new AppError(`فشل في الحصول على خدمات المزود: ${error.message}`, 500));
  }
});

// شراء رقم من مزود الخدمة
exports.purchaseNumber = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { serviceId, countryId, operator } = req.body;
  
  if (!serviceId || !countryId) {
    return next(new AppError('يجب توفير معرف الخدمة والدولة', 400));
  }
  
  // البحث عن المزود في قاعدة البيانات مع تضمين البيانات السرية مثل مفتاح API
  const provider = await Provider.findById(id).select('+apiKey +config');
  
  if (!provider) {
    return next(new AppError('لم يتم العثور على مزود خدمة بهذا المعرف', 404));
  }
  
  if (!provider.isActive) {
    return next(new AppError('مزود الخدمة هذا غير نشط', 400));
  }
  
  try {
    // إنشاء كائن مزود الخدمة المناسب
    const providerService = ProviderFactory.createProvider(provider);
    
    // شراء الرقم
    const number = await providerService.purchaseNumber(serviceId, countryId, operator || "any");
    
    res.status(200).json({
      status: 'success',
      data: number
    });
  } catch (error) {
    return next(new AppError(`فشل في شراء الرقم: ${error.message}`, 500));
  }
});

// التحقق من حالة الرقم
exports.checkNumber = catchAsync(async (req, res, next) => {
  const { id, numberId } = req.params;
  
  // البحث عن المزود في قاعدة البيانات مع تضمين البيانات السرية مثل مفتاح API
  const provider = await Provider.findById(id).select('+apiKey +config');
  
  if (!provider) {
    return next(new AppError('لم يتم العثور على مزود خدمة بهذا المعرف', 404));
  }
  
  try {
    // إنشاء كائن مزود الخدمة المناسب
    const providerService = ProviderFactory.createProvider(provider);
    
    // التحقق من حالة الرقم
    const numberStatus = await providerService.checkNumber(numberId);
    
    res.status(200).json({
      status: 'success',
      data: numberStatus
    });
  } catch (error) {
    return next(new AppError(`فشل في التحقق من حالة الرقم: ${error.message}`, 500));
  }
});

// اختبار الاتصال بمزود الخدمة
exports.testConnection = catchAsync(async (req, res, next) => {
  const providerId = req.params.id;
  
  // البحث عن المزود في قاعدة البيانات مع تضمين البيانات السرية مثل مفتاح API
  const provider = await Provider.findById(providerId).select('+apiKey +config');
  
  if (!provider) {
    return next(new AppError('لم يتم العثور على مزود خدمة بهذا المعرف', 404));
  }
  
  try {
    // إنشاء كائن مزود الخدمة المناسب
    const providerService = ProviderFactory.createProvider(provider);
    
    // اختبار الاتصال عن طريق محاولة الحصول على الرصيد
    await providerService.getBalance();
    
    res.status(200).json({
      status: 'success',
      message: 'تم الاتصال بمزود الخدمة بنجاح'
    });
  } catch (error) {
    return next(new AppError(`فشل الاتصال بمزود الخدمة: ${error.message}`, 500));
  }
});
