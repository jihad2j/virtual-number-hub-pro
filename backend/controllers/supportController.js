
const SupportTicket = require('../models/SupportTicket');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// الحصول على تذاكر الدعم للمستخدم الحالي
exports.getUserTickets = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  
  const tickets = await SupportTicket.find({ userId })
    .sort({ createdAt: -1 });
  
  res.status(200).json({
    status: 'success',
    results: tickets.length,
    data: tickets
  });
});

// إنشاء تذكرة دعم جديدة
exports.createTicket = catchAsync(async (req, res, next) => {
  const { subject, message } = req.body;
  const userId = req.user.id;
  
  if (!subject || !message) {
    return next(new AppError('يرجى توفير موضوع ورسالة للتذكرة', 400));
  }
  
  const ticket = await SupportTicket.create({
    userId,
    subject,
    message,
    status: 'open',
    responses: []
  });
  
  res.status(201).json({
    status: 'success',
    data: ticket
  });
});

// الرد على تذكرة دعم
exports.respondToTicket = catchAsync(async (req, res, next) => {
  const { message } = req.body;
  const ticketId = req.params.id;
  const userId = req.user.id;
  const isAdmin = req.user.role === 'admin';
  
  if (!message) {
    return next(new AppError('يرجى توفير رسالة للرد', 400));
  }
  
  const ticket = await SupportTicket.findById(ticketId);
  
  if (!ticket) {
    return next(new AppError('لم يتم العثور على تذكرة بهذا المعرف', 404));
  }
  
  // التحقق من أن التذكرة تنتمي للمستخدم أو أن المستخدم مشرف
  if (!isAdmin && ticket.userId.toString() !== userId.toString()) {
    return next(new AppError('ليس لديك صلاحية للرد على هذه التذكرة', 403));
  }
  
  // إضافة الرد
  ticket.responses.push({
    message,
    fromAdmin: isAdmin,
    createdAt: Date.now()
  });
  
  // إذا كانت التذكرة مغلقة وتم الرد عليها، يتم فتحها مرة أخرى
  if (ticket.status === 'closed') {
    ticket.status = 'open';
  }
  
  await ticket.save();
  
  res.status(200).json({
    status: 'success',
    data: ticket
  });
});

// إغلاق تذكرة دعم
exports.closeTicket = catchAsync(async (req, res, next) => {
  const ticketId = req.params.id;
  const userId = req.user.id;
  const isAdmin = req.user.role === 'admin';
  
  const ticket = await SupportTicket.findById(ticketId);
  
  if (!ticket) {
    return next(new AppError('لم يتم العثور على تذكرة بهذا المعرف', 404));
  }
  
  // التحقق من أن التذكرة تنتمي للمستخدم أو أن المستخدم مشرف
  if (!isAdmin && ticket.userId.toString() !== userId.toString()) {
    return next(new AppError('ليس لديك صلاحية لإغلاق هذه التذكرة', 403));
  }
  
  ticket.status = 'closed';
  await ticket.save();
  
  res.status(200).json({
    status: 'success',
    data: ticket
  });
});

// الحصول على جميع تذاكر الدعم (للمشرفين فقط)
exports.getAllTickets = catchAsync(async (req, res, next) => {
  const tickets = await SupportTicket.find()
    .populate('userId', 'username email')
    .sort({ createdAt: -1 });
  
  res.status(200).json({
    status: 'success',
    results: tickets.length,
    data: tickets
  });
});

// تحديث حالة تذكرة دعم (للمشرفين فقط)
exports.updateTicketStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;
  
  if (!status || !['open', 'closed'].includes(status)) {
    return next(new AppError('يرجى توفير حالة صالحة للتذكرة', 400));
  }
  
  const ticket = await SupportTicket.findById(req.params.id);
  
  if (!ticket) {
    return next(new AppError('لم يتم العثور على تذكرة بهذا المعرف', 404));
  }
  
  ticket.status = status;
  await ticket.save();
  
  res.status(200).json({
    status: 'success',
    data: ticket
  });
});
