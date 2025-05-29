
const Number = require('../models/Number');
const Provider = require('../models/Provider');
const User = require('../models/User');
const UserApplication = require('../models/UserApplication');
const Transaction = require('../models/Transaction');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { ProviderFactory } = require('../services/providerFactory');

// شراء رقم جديد باستخدام النظام الجديد
exports.purchaseNumber = catchAsync(async (req, res, next) => {
  const { applicationId, providerName, countryName, applicationName, serverName } = req.body;
  const userId = req.user.id;
  
  // البحث عن التطبيق في قاعدة البيانات
  let userApplication;
  if (applicationId) {
    userApplication = await UserApplication.findById(applicationId);
  } else {
    // البحث باستخدام البيانات المرسلة
    userApplication = await UserApplication.findOne({
      name: applicationName,
      providerName,
      countryName,
      serverName
    });
  }
  
  if (!userApplication) {
    return next(new AppError('لم يتم العثور على التطبيق المحدد', 404));
  }
  
  // البحث عن المزود باستخدام اسم المزود
  const provider = await Provider.findOne({ name: providerName }).select('+apiKey');
  
  if (!provider) {
    return next(new AppError('لم يتم العثور على مزود الخدمة المحدد', 404));
  }
  
  // التحقق من رصيد المستخدم
  const user = await User.findById(userId);
  if (user.balance < userApplication.price) {
    return next(new AppError('رصيدك غير كافي لشراء هذا التطبيق', 400));
  }
  
  // إنشاء كائن المزود المناسب باستخدام مصنع المزودين
  const providerService = ProviderFactory.createProvider(provider);
  
  try {
    // الحصول على رمز الدولة من المزود
    const countries = await providerService.getCountries();
    const country = countries.find(c => c.name === countryName || c.name.includes(countryName));
    
    if (!country) {
      return next(new AppError('لم يتم العثور على الدولة المحددة لدى المزود', 404));
    }
    
    // الحصول على الخدمات المتاحة للدولة
    const services = await providerService.getServices(country.code);
    const service = services.find(s => s.name === serverName || s.id === serverName);
    
    if (!service) {
      return next(new AppError('لم يتم العثور على السيرفر المحدد لدى المزود', 404));
    }
    
    // شراء رقم من مزود الخدمة
    const purchaseData = await providerService.purchaseNumber({
      countryCode: country.code,
      service: service.id
    });
    
    // إنشاء سجل الرقم في قاعدة البيانات
    const newNumber = await Number.create({
      providerId: provider.id,
      userId,
      number: purchaseData.phone || purchaseData.number,
      countryCode: country.code,
      countryName: countryName,
      service: applicationName,
      status: 'active',
      providerNumberId: purchaseData.id,
      expiresAt: new Date(Date.now() + 20 * 60 * 1000), // 20 دقيقة من الآن
      price: userApplication.price
    });
    
    // إنشاء معاملة للمستخدم (خصم من رصيده)
    await Transaction.create({
      userId,
      amount: -userApplication.price,
      type: 'purchase',
      status: 'completed',
      description: `شراء رقم ${newNumber.number} لتطبيق ${applicationName}`
    });
    
    // تحديث رصيد المستخدم
    await User.findByIdAndUpdate(
      userId,
      { $inc: { balance: -userApplication.price } }
    );
    
    res.status(201).json({
      status: 'success',
      data: newNumber
    });
  } catch (error) {
    return next(new AppError(`فشل في شراء الرقم: ${error.message}`, 400));
  }
});

// التحقق من حالة رقم
exports.checkNumber = catchAsync(async (req, res, next) => {
  const numberId = req.params.id;
  
  // البحث عن الرقم في قاعدة البيانات
  const number = await Number.findById(numberId);
  
  if (!number) {
    return next(new AppError('لم يتم العثور على الرقم المحدد', 404));
  }
  
  // التأكد من أن الرقم يخص المستخدم الحالي أو أن المستخدم مشرف
  if (number.userId.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('ليس لديك صلاحية للوصول إلى هذا الرقم', 403));
  }
  
  // البحث عن المزود مع استرجاع apiKey
  const provider = await Provider.findById(number.providerId).select('+apiKey');
  
  if (!provider) {
    return next(new AppError('لم يتم العثور على مزود الخدمة المرتبط بهذا الرقم', 404));
  }
  
  try {
    // إنشاء كائن المزود المناسب باستخدام مصنع المزودين
    const providerService = ProviderFactory.createProvider(provider);
    
    // التحقق من حالة الرقم لدى مزود الخدمة
    const numberStatus = await providerService.checkNumber(number.providerNumberId);
    
    // تحديث سجل الرقم في قاعدة البيانات إذا تم العثور على رمز SMS
    if (numberStatus.sms && numberStatus.sms.length > 0) {
      number.smsCode = numberStatus.sms[0].code || numberStatus.sms[0].text;
      number.status = 'completed';
      await number.save();
    }
    
    res.status(200).json({
      status: 'success',
      data: number
    });
  } catch (error) {
    return next(new AppError(`فشل في التحقق من حالة الرقم: ${error.message}`, 400));
  }
});

// إلغاء رقم
exports.cancelNumber = catchAsync(async (req, res, next) => {
  const numberId = req.params.id;
  
  // البحث عن الرقم في قاعدة البيانات
  const number = await Number.findById(numberId);
  
  if (!number) {
    return next(new AppError('لم يتم العثور على الرقم المحدد', 404));
  }
  
  // التأكد من أن الرقم يخص المستخدم الحالي أو أن المستخدم مشرف
  if (number.userId.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('ليس لديك صلاحية للوصول إلى هذا الرقم', 403));
  }
  
  // التأكد من أن الرقم لم يتم إلغاؤه بالفعل
  if (number.status === 'cancelled') {
    return next(new AppError('تم إلغاء هذا الرقم بالفعل', 400));
  }
  
  // البحث عن المزود مع استرجاع apiKey
  const provider = await Provider.findById(number.providerId).select('+apiKey');
  
  if (!provider) {
    return next(new AppError('لم يتم العثور على مزود الخدمة المرتبط بهذا الرقم', 404));
  }
  
  try {
    // إنشاء كائن المزود المناسب باستخدام مصنع المزودين
    const providerService = ProviderFactory.createProvider(provider);
    
    // إلغاء الرقم لدى مزود الخدمة
    const cancelResult = await providerService.cancelNumber(number.providerNumberId);
    
    if (cancelResult) {
      // تحديث سجل الرقم في قاعدة البيانات
      number.status = 'cancelled';
      await number.save();
      
      // إرجاع المبلغ للمستخدم (إذا كانت السياسة تسمح بذلك)
      if (number.price > 0) {
        // إنشاء معاملة استرجاع للمستخدم
        await Transaction.create({
          userId: number.userId,
          amount: number.price,
          type: 'refund',
          status: 'completed',
          description: `استرجاع المبلغ لإلغاء الرقم ${number.number}`
        });
        
        // تحديث رصيد المستخدم
        await User.findByIdAndUpdate(
          number.userId,
          { $inc: { balance: number.price } }
        );
      }
    }
    
    res.status(200).json({
      status: 'success',
      success: cancelResult
    });
  } catch (error) {
    return next(new AppError(`فشل في إلغاء الرقم: ${error.message}`, 400));
  }
});

// الحصول على جميع أرقام المستخدم الحالي
exports.getUserNumbers = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  
  const numbers = await Number.find({ userId }).sort({ createdAt: -1 });
  
  res.status(200).json({
    status: 'success',
    results: numbers.length,
    data: numbers
  });
});

// الحصول على جميع الأرقام (للمسؤولين فقط)
exports.getAllNumbers = catchAsync(async (req, res, next) => {
  const numbers = await Number.find().sort({ createdAt: -1 });
  
  res.status(200).json({
    status: 'success',
    results: numbers.length,
    data: numbers
  });
});
