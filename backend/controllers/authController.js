
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// إنشاء توكن JWT
const signToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// إرسال توكن للمستخدم
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  
  // إخفاء كلمة المرور من الإخراج
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user }
  });
};

// تسجيل مستخدم جديد
exports.register = catchAsync(async (req, res, next) => {
  const { username, email, password } = req.body;
  
  // التحقق من وجود البريد الإلكتروني
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('هذا البريد الإلكتروني مستخدم بالفعل', 400));
  }
  
  // إنشاء مستخدم جديد
  const newUser = await User.create({
    username,
    email,
    password,
    role: 'user',
    balance: 0,
    isActive: true,
    lastLogin: Date.now()
  });
  
  createSendToken(newUser, 201, res);
});

// تسجيل الدخول
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  
  // التحقق من وجود البريد الإلكتروني وكلمة المرور
  if (!email || !password) {
    return next(new AppError('يرجى توفير البريد الإلكتروني وكلمة المرور', 400));
  }
  
  // التحقق من صحة المستخدم
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password, user.password))) {
    return next(new AppError('البريد الإلكتروني أو كلمة المرور غير صحيحة', 401));
  }
  
  // التحقق من أن الحساب نشط
  if (!user.isActive) {
    return next(new AppError('هذا الحساب غير نشط حاليًا', 401));
  }
  
  // تحديث آخر تسجيل دخول
  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });
  
  createSendToken(user, 200, res);
});

// تسجيل الخروج
exports.logout = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'تم تسجيل الخروج بنجاح'
  });
};

// حماية المسارات
exports.protect = catchAsync(async (req, res, next) => {
  // التحقق من وجود التوكن
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  if (!token || token === 'undefined' || token === 'null') {
    return next(new AppError('أنت غير مسجل الدخول', 401));
  }
  
  try {
    // التحقق من صحة التوكن
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    
    // التحقق من وجود المستخدم
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError('المستخدم المالك لهذا التوكن لم يعد موجودًا', 401));
    }
    
    // التحقق من أن المستخدم نشط
    if (!currentUser.isActive) {
      return next(new AppError('هذا الحساب غير نشط حاليًا', 401));
    }
    
    // حفظ المستخدم للطلبات اللاحقة
    req.user = currentUser;
    next();
  } catch (err) {
    return next(new AppError('خطأ في التحقق من التوكن، يرجى تسجيل الدخول مرة أخرى', 401));
  }
});

// تقييد الوصول حسب الدور
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('ليس لديك إذن للقيام بهذا الإجراء', 403)
      );
    }
    next();
  };
};

// الحصول على بيانات المستخدم الحالي
exports.getMe = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: { user: req.user }
  });
});

// تحديث كلمة المرور
exports.updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  
  // التحقق من وجود كلمة المرور الحالية والجديدة
  if (!currentPassword || !newPassword) {
    return next(new AppError('يرجى توفير كلمة المرور الحالية والجديدة', 400));
  }
  
  // الحصول على المستخدم مع كلمة المرور
  const user = await User.findById(req.user.id).select('+password');
  
  // التحقق من صحة كلمة المرور الحالية
  if (!(await user.comparePassword(currentPassword, user.password))) {
    return next(new AppError('كلمة المرور الحالية غير صحيحة', 401));
  }
  
  // تحديث كلمة المرور
  user.password = newPassword;
  await user.save();
  
  createSendToken(user, 200, res);
});
