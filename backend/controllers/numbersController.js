
const PhoneNumber = require('../models/PhoneNumber');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// الحصول على الأرقام حسب الدولة
exports.getNumbersByCountry = catchAsync(async (req, res, next) => {
  const { countryId } = req.params;
  const numbers = await PhoneNumber.find({
    country: countryId,
    status: 'available'
  })
    .populate('country')
    .populate('provider');
  
  res.status(200).json({
    status: 'success',
    results: numbers.length,
    data: numbers
  });
});

// شراء رقم
exports.purchaseNumber = catchAsync(async (req, res, next) => {
  const { numberId } = req.params;
  const userId = req.user.id;
  
  // البحث عن الرقم
  const number = await PhoneNumber.findById(numberId);
  if (!number) {
    return next(new AppError('لم يتم العثور على رقم بهذا المعرف', 404));
  }
  
  // التحقق من أن الرقم متاح
  if (number.status !== 'available') {
    return next(new AppError('هذا الرقم غير متاح للشراء', 400));
  }
  
  // التحقق من رصيد المستخدم
  const user = await User.findById(userId);
  if (user.balance < number.price) {
    return next(new AppError('رصيدك غير كافٍ لشراء هذا الرقم', 400));
  }
  
  // تحديث حالة الرقم
  number.status = 'sold';
  number.userId = userId;
  await number.save();
  
  // خصم المبلغ من رصيد المستخدم
  user.balance -= number.price;
  await user.save();
  
  // إنشاء معاملة
  await Transaction.create({
    userId,
    amount: number.price,
    type: 'purchase',
    status: 'completed',
    description: `شراء رقم افتراضي ${number.number}`
  });
  
  res.status(200).json({
    status: 'success',
    data: number
  });
});

// الحصول على أرقام المستخدم
exports.getUserNumbers = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const numbers = await PhoneNumber.find({
    userId,
    status: 'sold'
  })
    .populate('country')
    .populate('provider');
  
  res.status(200).json({
    status: 'success',
    results: numbers.length,
    data: numbers
  });
});

// إنشاء رقم جديد (للمشرفين فقط)
exports.createNumber = catchAsync(async (req, res, next) => {
  const newNumber = await PhoneNumber.create(req.body);
  
  res.status(201).json({
    status: 'success',
    data: newNumber
  });
});

// تحديث رقم (للمشرفين فقط)
exports.updateNumber = catchAsync(async (req, res, next) => {
  const number = await PhoneNumber.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );
  
  if (!number) {
    return next(new AppError('لم يتم العثور على رقم بهذا المعرف', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: number
  });
});

// حذف رقم (للمشرفين فقط)
exports.deleteNumber = catchAsync(async (req, res, next) => {
  const number = await PhoneNumber.findByIdAndDelete(req.params.id);
  
  if (!number) {
    return next(new AppError('لم يتم العثور على رقم بهذا المعرف', 404));
  }
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});
