
const User = require('../models/User');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// الحصول على جميع المستخدمين
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: users
  });
});

// الحصول على مستخدم بواسطة المعرف
exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return next(new AppError('لم يتم العثور على مستخدم بهذا المعرف', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: user
  });
});

// إنشاء مستخدم جديد
exports.createUser = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  
  // إخفاء كلمة المرور من الاستجابة
  newUser.password = undefined;
  
  res.status(201).json({
    status: 'success',
    data: newUser
  });
});

// تحديث مستخدم
exports.updateUser = catchAsync(async (req, res, next) => {
  // منع تحديث كلمة المرور باستخدام هذه الطريقة
  if (req.body.password) {
    return next(new AppError('لا يمكن تحديث كلمة المرور باستخدام هذه الطريقة', 400));
  }
  
  const user = await User.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );
  
  if (!user) {
    return next(new AppError('لم يتم العثور على مستخدم بهذا المعرف', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: user
  });
});

// حذف مستخدم
exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  
  if (!user) {
    return next(new AppError('لم يتم العثور على مستخدم بهذا المعرف', 404));
  }
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

// تحديث رصيد المستخدم
exports.updateUserBalance = catchAsync(async (req, res, next) => {
  const { amount, operation } = req.body;
  
  if (!amount || !operation || !['add', 'subtract'].includes(operation)) {
    return next(new AppError('يرجى توفير المبلغ ونوع العملية (add أو subtract)', 400));
  }
  
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return next(new AppError('لم يتم العثور على مستخدم بهذا المعرف', 404));
  }
  
  if (operation === 'add') {
    user.balance += amount;
  } else {
    if (user.balance < amount) {
      return next(new AppError('رصيد المستخدم غير كافٍ للخصم', 400));
    }
    user.balance -= amount;
  }
  
  await user.save();
  
  res.status(200).json({
    status: 'success',
    data: user
  });
});
