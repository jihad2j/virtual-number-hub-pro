
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// Middleware to protect routes - verify the user is authenticated
module.exports = catchAsync(async (req, res, next) => {
  // 1) Get the token from the request headers
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token || token === 'undefined' || token === 'null') {
    return next(new AppError('أنت غير مسجل الدخول. يرجى تسجيل الدخول للوصول', 401));
  }

  try {
    // 2) Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3) Check if the user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError('المستخدم الذي ينتمي إليه هذا الرمز لم يعد موجودًا', 401));
    }

    // 4) Check if user is active
    if (!currentUser.isActive) {
      return next(new AppError('هذا الحساب غير نشط حاليًا', 401));
    }

    // Grant access to protected route
    req.user = currentUser;
    next();
  } catch (err) {
    return next(new AppError('خطأ في التحقق من التوكن، يرجى تسجيل الدخول مرة أخرى', 401));
  }
});
