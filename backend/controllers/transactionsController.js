
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// الحصول على معاملات المستخدم
exports.getUserTransactions = catchAsync(async (req, res, next) => {
  const transactions = await Transaction.find({ userId: req.user.id })
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: transactions.length,
    data: transactions
  });
});

// إنشاء معاملة إيداع
exports.createDepositTransaction = catchAsync(async (req, res, next) => {
  const { amount, method } = req.body;

  if (!amount || amount <= 0) {
    return next(new AppError('يرجى إدخال مبلغ صالح', 400));
  }

  // إنشاء معاملة جديدة
  const transaction = await Transaction.create({
    userId: req.user.id,
    type: 'deposit',
    amount,
    method: method || 'manual',
    status: 'pending',
    description: `إيداع رصيد بمبلغ ${amount}`
  });

  res.status(201).json({
    status: 'success',
    data: transaction
  });
});

// إهداء الرصيد
exports.giftBalance = catchAsync(async (req, res, next) => {
  const { recipientId, amount, note } = req.body;

  if (!recipientId || !amount) {
    return next(new AppError('يرجى إدخال معرف المستلم والمبلغ', 400));
  }

  if (amount <= 0) {
    return next(new AppError('يرجى إدخال مبلغ صالح', 400));
  }

  // التحقق من رصيد المرسل
  const sender = await User.findById(req.user.id);
  if (!sender || sender.balance < amount) {
    return next(new AppError('رصيدك غير كافٍ لإتمام هذه العملية', 400));
  }

  // البحث عن المستلم
  let recipient;
  
  // البحث بالبريد الإلكتروني أولاً
  if (recipientId.includes('@')) {
    recipient = await User.findOne({ email: recipientId });
  } else {
    // البحث باسم المستخدم
    recipient = await User.findOne({ username: recipientId });
  }

  if (!recipient) {
    return next(new AppError('لم يتم العثور على المستخدم المحدد', 404));
  }

  if (recipient._id.toString() === sender._id.toString()) {
    return next(new AppError('لا يمكنك إهداء الرصيد لنفسك', 400));
  }

  // تحديث الأرصدة
  sender.balance -= amount;
  recipient.balance += amount;

  await sender.save();
  await recipient.save();

  // إنشاء معاملات للطرفين
  await Transaction.create({
    userId: sender._id,
    type: 'gift_sent',
    amount: -amount,
    status: 'completed',
    description: `إهداء رصيد إلى ${recipient.username}${note ? ': ' + note : ''}`
  });

  await Transaction.create({
    userId: recipient._id,
    type: 'gift_received',
    amount: amount,
    status: 'completed',
    description: `استلام رصيد من ${sender.username}${note ? ': ' + note : ''}`
  });

  res.status(200).json({
    status: 'success',
    message: 'تم إهداء الرصيد بنجاح',
    data: {
      sender: {
        username: sender.username,
        newBalance: sender.balance
      },
      recipient: {
        username: recipient.username,
        newBalance: recipient.balance
      },
      amount
    }
  });
});

// الحصول على جميع المعاملات (للمشرفين)
exports.getAllTransactions = catchAsync(async (req, res, next) => {
  const transactions = await Transaction.find()
    .populate('userId', 'username email')
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: transactions.length,
    data: transactions
  });
});

// تحديث حالة المعاملة
exports.updateTransactionStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;
  const transaction = await Transaction.findById(req.params.id);

  if (!transaction) {
    return next(new AppError('لم يتم العثور على المعاملة', 404));
  }

  transaction.status = status;
  await transaction.save();

  res.status(200).json({
    status: 'success',
    data: transaction
  });
});

// بيانات المبيعات للإحصائيات
exports.getSalesData = catchAsync(async (req, res, next) => {
  const salesData = [
    { name: 'يناير', sales: 2400 },
    { name: 'فبراير', sales: 1398 },
    { name: 'مارس', sales: 9800 },
    { name: 'أبريل', sales: 3908 },
    { name: 'مايو', sales: 4800 },
    { name: 'يونيو', sales: 3800 }
  ];

  res.status(200).json({
    status: 'success',
    data: salesData
  });
});

// عدد المستخدمين النشطين
exports.getActiveUsersCount = catchAsync(async (req, res, next) => {
  const activeUsers = await User.countDocuments({ isActive: true });

  res.status(200).json({
    status: 'success',
    data: { activeUsers }
  });
});
