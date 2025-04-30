
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// الحصول على معاملات المستخدم الحالي
exports.getUserTransactions = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  
  const transactions = await Transaction.find({ userId })
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
  const userId = req.user.id;
  
  if (!amount || amount <= 0) {
    return next(new AppError('يرجى توفير مبلغ صالح للإيداع', 400));
  }
  
  // إنشاء المعاملة
  const transaction = await Transaction.create({
    userId,
    amount,
    type: 'deposit',
    status: 'completed',
    description: `إيداع رصيد عبر ${method === 'card' ? 'بطاقة الائتمان' : 'PayPal'}`,
    paymentMethod: method
  });
  
  // تحديث رصيد المستخدم
  const user = await User.findById(userId);
  user.balance += amount;
  await user.save();
  
  res.status(201).json({
    status: 'success',
    data: transaction
  });
});

// الحصول على جميع المعاملات (للمشرفين فقط)
exports.getAllTransactions = catchAsync(async (req, res, next) => {
  const transactions = await Transaction.find()
    .sort({ createdAt: -1 })
    .populate('userId', 'username email');
  
  res.status(200).json({
    status: 'success',
    results: transactions.length,
    data: transactions
  });
});

// تحديث حالة المعاملة (للمشرفين فقط)
exports.updateTransactionStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;
  
  if (!status || !['pending', 'completed', 'failed'].includes(status)) {
    return next(new AppError('يرجى توفير حالة صالحة للمعاملة', 400));
  }
  
  const transaction = await Transaction.findById(req.params.id);
  
  if (!transaction) {
    return next(new AppError('لم يتم العثور على معاملة بهذا المعرف', 404));
  }
  
  // إذا كانت المعاملة من نوع إيداع وتم تغييرها من معلقة إلى مكتملة، يجب تحديث رصيد المستخدم
  if (transaction.type === 'deposit' && transaction.status === 'pending' && status === 'completed') {
    const user = await User.findById(transaction.userId);
    user.balance += transaction.amount;
    await user.save();
  }
  
  // إذا كانت المعاملة من نوع إيداع وتم تغييرها من مكتملة إلى فاشلة، يجب خصم المبلغ من رصيد المستخدم
  if (transaction.type === 'deposit' && transaction.status === 'completed' && status === 'failed') {
    const user = await User.findById(transaction.userId);
    if (user.balance >= transaction.amount) {
      user.balance -= transaction.amount;
      await user.save();
    }
  }
  
  transaction.status = status;
  await transaction.save();
  
  res.status(200).json({
    status: 'success',
    data: transaction
  });
});
