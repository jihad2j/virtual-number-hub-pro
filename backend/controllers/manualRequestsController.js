
const ManualRequest = require('../models/ManualRequest');
const ManualService = require('../models/ManualService');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// الحصول على طلبات التفعيل اليدوي للمستخدم الحالي
exports.getUserManualRequests = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  
  const requests = await ManualRequest.find({ userId })
    .populate('serviceId')
    .sort({ createdAt: -1 });
  
  res.status(200).json({
    status: 'success',
    results: requests.length,
    data: requests
  });
});

// إنشاء طلب تفعيل يدوي جديد
exports.createManualRequest = catchAsync(async (req, res, next) => {
  const { serviceId, notes } = req.body;
  const userId = req.user.id;
  
  // التحقق من وجود الخدمة
  const service = await ManualService.findById(serviceId);
  if (!service) {
    return next(new AppError('لم يتم العثور على خدمة بهذا المعرف', 404));
  }
  
  // التحقق من توفر الخدمة
  if (!service.available) {
    return next(new AppError('هذه الخدمة غير متاحة حاليًا', 400));
  }
  
  // التحقق من رصيد المستخدم
  const user = await User.findById(userId);
  if (user.balance < service.price) {
    return next(new AppError('رصيدك غير كافٍ لطلب هذه الخدمة', 400));
  }
  
  // خصم المبلغ من رصيد المستخدم
  user.balance -= service.price;
  await user.save();
  
  // إنشاء معاملة
  await Transaction.create({
    userId,
    amount: service.price,
    type: 'purchase',
    status: 'completed',
    description: `طلب خدمة تفعيل يدوي: ${service.name}`
  });
  
  // إنشاء الطلب
  const request = await ManualRequest.create({
    userId,
    serviceId,
    serviceName: service.name,
    status: 'pending',
    notes: notes || ''
  });
  
  res.status(201).json({
    status: 'success',
    data: request
  });
});

// الحصول على جميع طلبات التفعيل اليدوي (للمشرفين فقط)
exports.getAllManualRequests = catchAsync(async (req, res, next) => {
  const requests = await ManualRequest.find()
    .populate({
      path: 'userId',
      select: 'username email'
    })
    .populate('serviceId')
    .sort({ createdAt: -1 });
  
  // تحويل إلى الشكل المطلوب للعميل
  const formattedRequests = requests.map(request => ({
    id: request._id,
    userId: request.userId._id,
    userName: request.userId.username,
    userEmail: request.userId.email,
    serviceId: request.serviceId._id,
    serviceName: request.serviceName,
    status: request.status,
    notes: request.notes,
    adminResponse: request.adminResponse,
    verificationCode: request.verificationCode,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt
  }));
  
  res.status(200).json({
    status: 'success',
    results: formattedRequests.length,
    data: formattedRequests
  });
});

// الرد على طلب تفعيل يدوي (للمشرفين فقط)
exports.respondToManualRequest = catchAsync(async (req, res, next) => {
  const { adminResponse, verificationCode, status } = req.body;
  
  const request = await ManualRequest.findById(req.params.id);
  
  if (!request) {
    return next(new AppError('لم يتم العثور على طلب بهذا المعرف', 404));
  }
  
  // تحديث الطلب
  if (adminResponse) request.adminResponse = adminResponse;
  if (verificationCode) request.verificationCode = verificationCode;
  if (status && ['pending', 'processing', 'completed', 'cancelled'].includes(status)) {
    request.status = status;
  }
  
  await request.save();
  
  res.status(200).json({
    status: 'success',
    data: request
  });
});

// تحديث حالة طلب تفعيل يدوي (للمشرفين فقط)
exports.updateManualRequestStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;
  
  if (!status || !['processing', 'completed', 'cancelled'].includes(status)) {
    return next(new AppError('يرجى توفير حالة صالحة للطلب', 400));
  }
  
  const request = await ManualRequest.findById(req.params.id);
  
  if (!request) {
    return next(new AppError('لم يتم العثور على طلب بهذا المعرف', 404));
  }
  
  request.status = status;
  await request.save();
  
  res.status(200).json({
    status: 'success',
    data: request
  });
});

// تأكيد اكتمال طلب تفعيل يدوي (للمستخدم)
exports.confirmManualRequest = catchAsync(async (req, res, next) => {
  const requestId = req.params.id;
  const userId = req.user.id;
  
  const request = await ManualRequest.findOne({
    _id: requestId,
    userId
  });
  
  if (!request) {
    return next(new AppError('لم يتم العثور على طلب بهذا المعرف', 404));
  }
  
  if (request.status !== 'processing') {
    return next(new AppError('لا يمكن تأكيد اكتمال طلب غير قيد المعالجة', 400));
  }
  
  request.status = 'completed';
  await request.save();
  
  res.status(200).json({
    status: 'success',
    data: request
  });
});
