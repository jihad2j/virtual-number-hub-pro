
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const mongoose = require('mongoose');

// الحصول على معاملات المستخدم الحالي
exports.getUserTransactions = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  
  // البحث عن المعاملات التي قام بها المستخدم الحالي
  // أو المعاملات التي استلمها كهدية (recipientId)
  const transactions = await Transaction.find({
    $or: [
      { userId },
      { recipientId: userId, type: 'gift' }
    ]
  }).sort({ createdAt: -1 });
  
  res.status(200).json({
    status: 'success',
    results: transactions.length,
    data: transactions
  });
});

// إنشاء معاملة إيداع جديدة
exports.createDepositTransaction = catchAsync(async (req, res, next) => {
  const { amount, paymentMethod } = req.body;
  const userId = req.user.id;
  
  if (!amount || amount <= 0) {
    return next(new AppError('يجب توفير مبلغ إيجابي', 400));
  }
  
  if (!paymentMethod || !['card', 'paypal', 'other'].includes(paymentMethod)) {
    return next(new AppError('طريقة الدفع غير صالحة', 400));
  }
  
  // إنشاء معاملة جديدة
  const transaction = await Transaction.create({
    userId,
    amount,
    type: 'deposit',
    status: 'pending', // يمكن تغييرها لاحقًا بعد التأكد من نجاح عملية الدفع
    description: `إيداع ${amount}$ باستخدام ${paymentMethod === 'card' ? 'بطاقة ائتمان' : paymentMethod === 'paypal' ? 'PayPal' : 'طريقة أخرى'}`,
    paymentMethod
  });
  
  // في حالة التطبيق الحقيقي، هنا ستقوم بمعالجة الدفع من خلال بوابة دفع
  // بعد نجاح عملية الدفع، يمكنك تحديث حالة المعاملة ورصيد المستخدم
  
  // تحديث حالة المعاملة إلى مكتملة (للعرض التوضيحي فقط)
  transaction.status = 'completed';
  await transaction.save();
  
  // تحديث رصيد المستخدم
  await User.findByIdAndUpdate(userId, { $inc: { balance: amount } });
  
  res.status(201).json({
    status: 'success',
    data: transaction
  });
});

// إنشاء معاملة هدية (إهداء رصيد لمستخدم آخر)
exports.giftBalance = catchAsync(async (req, res, next) => {
  const { recipientId, amount } = req.body;
  const senderId = req.user.id;
  
  // التحقق من صحة البيانات
  if (!recipientId || !mongoose.Types.ObjectId.isValid(recipientId)) {
    return next(new AppError('معرف المستلم غير صالح', 400));
  }
  
  if (!amount || amount <= 0) {
    return next(new AppError('يجب توفير مبلغ إيجابي', 400));
  }
  
  // التحقق من وجود المستخدم المستلم
  const recipient = await User.findById(recipientId);
  if (!recipient) {
    return next(new AppError('المستخدم المستلم غير موجود', 404));
  }
  
  // التحقق من أن المستخدم لا يحاول إهداء نفسه
  if (senderId === recipientId) {
    return next(new AppError('لا يمكن إهداء الرصيد لنفسك', 400));
  }
  
  // التحقق من كفاية الرصيد
  const sender = await User.findById(senderId);
  if (sender.balance < amount) {
    return next(new AppError('رصيدك غير كافٍ لإتمام عملية الإهداء', 400));
  }
  
  // إنشاء معاملة الهدية
  const transaction = await Transaction.create({
    userId: senderId,
    recipientId,
    amount,
    type: 'gift',
    status: 'completed',
    description: `إهداء ${amount}$ إلى المستخدم ${recipient.username}`,
    paymentMethod: 'balance'
  });
  
  // تحديث الأرصدة في قاعدة البيانات
  await User.findByIdAndUpdate(senderId, { $inc: { balance: -amount } });
  await User.findByIdAndUpdate(recipientId, { $inc: { balance: amount } });
  
  res.status(201).json({
    status: 'success',
    data: transaction
  });
});

// الحصول على جميع المعاملات (للمشرفين فقط)
exports.getAllTransactions = catchAsync(async (req, res, next) => {
  const transactions = await Transaction.find()
    .populate('userId', 'username email')
    .populate('recipientId', 'username email')
    .sort({ createdAt: -1 });
  
  res.status(200).json({
    status: 'success',
    results: transactions.length,
    data: transactions
  });
});

// تحديث حالة معاملة (للمشرفين فقط)
exports.updateTransactionStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;
  
  if (!status || !['pending', 'completed', 'failed'].includes(status)) {
    return next(new AppError('حالة المعاملة غير صالحة', 400));
  }
  
  const transaction = await Transaction.findById(req.params.id);
  
  if (!transaction) {
    return next(new AppError('لم يتم العثور على معاملة بهذا المعرف', 404));
  }
  
  // إذا كانت المعاملة مكتملة بالفعل، لا يمكن تغيير حالتها
  if (transaction.status === 'completed' && status !== 'completed') {
    return next(new AppError('لا يمكن تغيير حالة المعاملة المكتملة', 400));
  }
  
  // إذا كانت المعاملة فاشلة بالفعل، لا يمكن تغيير حالتها
  if (transaction.status === 'failed' && status !== 'failed') {
    return next(new AppError('لا يمكن تغيير حالة المعاملة الفاشلة', 400));
  }
  
  // إذا كان التغيير من معلقة إلى مكتملة، قم بتحديث رصيد المستخدم
  if (transaction.status === 'pending' && status === 'completed') {
    if (transaction.type === 'deposit') {
      await User.findByIdAndUpdate(transaction.userId, { $inc: { balance: transaction.amount } });
    } else if (transaction.type === 'gift') {
      await User.findByIdAndUpdate(transaction.userId, { $inc: { balance: -transaction.amount } });
      await User.findByIdAndUpdate(transaction.recipientId, { $inc: { balance: transaction.amount } });
    }
  }
  
  // إذا كان التغيير من مكتملة إلى فاشلة (يمكن أن يحدث في حالات نادرة مثل عمليات احتيال)
  if (transaction.status === 'completed' && status === 'failed') {
    if (transaction.type === 'deposit') {
      await User.findByIdAndUpdate(transaction.userId, { $inc: { balance: -transaction.amount } });
    } else if (transaction.type === 'gift') {
      await User.findByIdAndUpdate(transaction.userId, { $inc: { balance: transaction.amount } });
      await User.findByIdAndUpdate(transaction.recipientId, { $inc: { balance: -transaction.amount } });
    }
  }
  
  transaction.status = status;
  await transaction.save();
  
  res.status(200).json({
    status: 'success',
    data: transaction
  });
});
