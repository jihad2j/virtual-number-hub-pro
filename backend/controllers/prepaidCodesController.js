
const PrepaidCode = require('../models/PrepaidCode');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const crypto = require('crypto');

// إنشاء أكواد شحن (للمشرفين فقط)
exports.generatePrepaidCodes = catchAsync(async (req, res, next) => {
  const { amount, count = 1 } = req.body;
  
  if (!amount || amount <= 0) {
    return next(new AppError('يرجى توفير قيمة صالحة للكود', 400));
  }
  
  if (count <= 0 || count > 100) {
    return next(new AppError('يرجى توفير عدد صالح للأكواد (1-100)', 400));
  }
  
  const codes = [];
  
  for (let i = 0; i < count; i++) {
    // إنشاء كود فريد مكون من 12 حرف
    const code = crypto.randomBytes(6).toString('hex').toUpperCase();
    
    codes.push({
      code,
      amount,
      isUsed: false
    });
  }
  
  const prepaidCodes = await PrepaidCode.create(codes);
  
  res.status(201).json({
    status: 'success',
    results: prepaidCodes.length,
    data: prepaidCodes
  });
});

// الحصول على جميع أكواد الشحن (للمشرفين فقط)
exports.getAllPrepaidCodes = catchAsync(async (req, res, next) => {
  const prepaidCodes = await PrepaidCode.find()
    .populate('usedBy', 'username email')
    .sort({ createdAt: -1 });
  
  res.status(200).json({
    status: 'success',
    results: prepaidCodes.length,
    data: prepaidCodes
  });
});

// استخدام كود شحن (للمستخدمين)
exports.redeemPrepaidCode = catchAsync(async (req, res, next) => {
  const { code } = req.body;
  
  if (!code) {
    return next(new AppError('يرجى توفير كود الشحن', 400));
  }
  
  const prepaidCode = await PrepaidCode.findOne({ code, isUsed: false });
  
  if (!prepaidCode) {
    return next(new AppError('كود الشحن غير صالح أو تم استخدامه بالفعل', 400));
  }
  
  // تحديث الكود بأنه تم استخدامه
  prepaidCode.isUsed = true;
  prepaidCode.usedBy = req.user.id;
  prepaidCode.usedAt = new Date();
  await prepaidCode.save();
  
  // إضافة رصيد للمستخدم
  const user = await User.findById(req.user.id);
  user.balance += prepaidCode.amount;
  await user.save();
  
  // إنشاء معاملة مالية
  const transaction = await Transaction.create({
    userId: req.user.id,
    amount: prepaidCode.amount,
    type: 'deposit',
    status: 'completed',
    description: `شحن رصيد باستخدام كود (${code})`,
    paymentMethod: 'prepaid_code'
  });
  
  res.status(200).json({
    status: 'success',
    data: {
      amount: prepaidCode.amount,
      transaction
    }
  });
});

// حذف كود شحن (للمشرفين فقط)
exports.deletePrepaidCode = catchAsync(async (req, res, next) => {
  const prepaidCode = await PrepaidCode.findByIdAndDelete(req.params.id);
  
  if (!prepaidCode) {
    return next(new AppError('لم يتم العثور على كود شحن بهذا المعرف', 404));
  }
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});
