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

// إهداء رصيد لمستخدم آخر
exports.giftBalance = catchAsync(async (req, res, next) => {
  const { recipient, amount, note } = req.body;
  const senderId = req.user.id;
  
  if (!recipient) {
    return next(new AppError('يرجى توفير معرف المستلم (اسم المستخدم أو البريد الإلكتروني أو المعرف)', 400));
  }
  
  if (!amount || amount <= 0) {
    return next(new AppError('يرجى توفير مبلغ صالح للإهداء', 400));
  }
  
  // البحث عن المستخدم المرسل
  const sender = await User.findById(senderId);
  
  // التأكد من وجود رصيد كافٍ
  if (sender.balance < amount) {
    return next(new AppError('رصيدك غير كافٍ لإتمام هذه العملية', 400));
  }
  
  // البحث عن المستخدم المستلم (بواسطة اسم المستخدم أو البريد الإلكتروني أو المعرف)
  let recipientUser;
  
  // محاولة البحث بالمعرف أولاً
  if (recipient.match(/^[0-9a-fA-F]{24}$/)) {
    recipientUser = await User.findById(recipient);
  }
  
  // إذا لم يتم العثور عليه، البحث باسم المستخدم أو البريد الإلكتروني
  if (!recipientUser) {
    recipientUser = await User.findOne({
      $or: [{ username: recipient }, { email: recipient }]
    });
  }
  
  if (!recipientUser) {
    return next(new AppError('لم يتم العثور على المستخدم المستلم', 404));
  }
  
  // التأكد من أن المستخدم لا يرسل لنفسه
  if (recipientUser.id === senderId) {
    return next(new AppError('لا يمكنك إهداء رصيد لنفسك', 400));
  }
  
  // خصم الرصيد من المرسل
  sender.balance -= amount;
  await sender.save();
  
  // إضافة الرصيد للمستلم
  recipientUser.balance += amount;
  await recipientUser.save();
  
  let description = `إهداء رصيد إلى ${recipientUser.username}`;
  if (note) {
    description += `: ${note}`;
  }

  // إنشاء معاملة للمرسل
  const senderTransaction = await Transaction.create({
    userId: senderId,
    amount: -amount,
    type: 'gift_sent',
    status: 'completed',
    description
  });
  
  // إنشاء معاملة للمستلم
  await Transaction.create({
    userId: recipientUser.id,
    amount,
    type: 'gift_received',
    status: 'completed',
    description: `استلام رصيد هدية من ${sender.username}${note ? ': ' + note : ''}`
  });
  
  res.status(201).json({
    status: 'success',
    data: senderTransaction,
    message: `تم إهداء ${amount}$ بنجاح إلى ${recipientUser.username}`
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

// الحصول على إحصاءات المبيعات (للمشرفين فقط)
exports.getSalesData = catchAsync(async (req, res, next) => {
  const { period = 'monthly' } = req.query;
  
  let dateFormat, groupByKey;
  
  if (period === 'daily') {
    dateFormat = '%Y-%m-%d';
    groupByKey = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } };
  } else if (period === 'weekly') {
    dateFormat = '%Y-W%U';
    groupByKey = { year: { $year: '$createdAt' }, week: { $week: '$createdAt' } };
  } else {
    dateFormat = '%Y-%m';
    groupByKey = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } };
  }
  
  const salesData = await Transaction.aggregate([
    {
      $match: {
        status: 'completed',
        type: { $in: ['deposit', 'purchase'] },
        createdAt: { $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) } // آخر 6 أشهر
      }
    },
    {
      $group: {
        _id: groupByKey,
        sales: {
          $sum: {
            $cond: [{ $eq: ['$type', 'purchase'] }, '$amount', 0]
          }
        },
        deposits: {
          $sum: {
            $cond: [{ $eq: ['$type', 'deposit'] }, '$amount', 0]
          }
        },
        profits: {
          // افتراضي: الربح هو 20% من قيمة المبيعات
          $sum: {
            $cond: [
              { $eq: ['$type', 'purchase'] },
              { $multiply: ['$amount', 0.2] },
              0
            ]
          }
        },
        date: { $first: '$createdAt' }
      }
    },
    {
      $project: {
        _id: 0,
        date: 1,
        sales: 1,
        deposits: 1,
        profits: 1
      }
    },
    {
      $sort: { date: 1 }
    }
  ]);
  
  // تنسيق التاريخ وتنسيق البيانات للاستخدام في الرسوم البيانية
  const formattedData = salesData.map(item => {
    let name;
    if (period === 'daily') {
      name = new Date(item.date).toLocaleDateString('ar-SA');
    } else if (period === 'weekly') {
      const date = new Date(item.date);
      const weekNumber = Math.ceil((date.getDate() + 6 - date.getDay()) / 7);
      name = `الأسبوع ${weekNumber}، ${date.getFullYear()}`;
    } else {
      const date = new Date(item.date);
      name = new Intl.DateTimeFormat('ar-SA', { year: 'numeric', month: 'long' }).format(date);
    }
    
    return {
      name,
      sales: item.sales,
      deposits: item.deposits,
      profits: item.profits
    };
  });
  
  res.status(200).json({
    status: 'success',
    data: formattedData
  });
});

// الحصول على عدد المستخدمين النشطين (للمشرفين فقط)
exports.getActiveUsersCount = catchAsync(async (req, res, next) => {
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  
  const activeUsers = await User.countDocuments({
    lastLogin: { $gte: lastMonth }
  });
  
  res.status(200).json({
    status: 'success',
    data: {
      count: activeUsers
    }
  });
});
