
const AppError = require('../utils/appError');

// Middleware to restrict routes to admin users only
module.exports = (req, res, next) => {
  // Check if the user exists and is an admin
  if (!req.user || req.user.role !== 'admin') {
    return next(new AppError('ليس لديك صلاحية للوصول إلى هذا المسار', 403));
  }
  
  next();
};
