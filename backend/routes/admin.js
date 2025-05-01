
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const PhoneNumber = require('../models/PhoneNumber');
const catchAsync = require('../utils/catchAsync');
const authController = require('../controllers/authController');

// Protect all routes
router.use(authController.protect);
router.use(authController.restrictTo('admin'));

// Define the /dashboard endpoint to serve admin dashboard stats
router.get('/dashboard', catchAsync(async (req, res) => {
  // Get total users count
  const totalUsers = await User.countDocuments();
  
  // Get total sales from transactions
  const transactions = await Transaction.find();
  const totalSales = transactions.reduce((sum, transaction) => {
    if (transaction.type === 'purchase' || transaction.type === 'manual') {
      return sum + transaction.amount;
    }
    return sum;
  }, 0);
  
  // Get total orders
  const totalOrders = await PhoneNumber.countDocuments();
  
  // Calculate growth rate (placeholder calculation)
  // In a real app, you would compare against previous period
  const growthRate = 5.2;
  
  // Create sample chart data (in a real app, this would be dynamic)
  const chartData = [
    { name: 'يناير', sales: 2400 },
    { name: 'فبراير', sales: 1398 },
    { name: 'مارس', sales: 9800 },
    { name: 'أبريل', sales: 3908 },
    { name: 'مايو', sales: 4800 },
    { name: 'يونيو', sales: 3800 },
  ];
  
  // Get recent transactions
  const recentTransactions = await Transaction.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('userId', 'username email');
    
  // Format the recent transactions for the frontend
  const formattedTransactions = recentTransactions.map(tx => {
    return {
      id: tx._id,
      username: tx.userId ? tx.userId.username : 'غير معروف',
      amount: tx.amount,
      type: tx.type,
      status: tx.status,
      createdAt: tx.createdAt
    };
  });
  
  res.status(200).json({
    status: 'success',
    data: {
      stats: {
        totalUsers,
        totalSales,
        totalOrders,
        growthRate
      },
      chartData,
      recentTransactions: formattedTransactions
    }
  });
}));

module.exports = router;
