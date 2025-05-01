
const express = require('express');
const transactionsController = require('../controllers/transactionsController');
const authController = require('../controllers/authController');
const router = express.Router();

// المسارات المحمية للمستخدمين المسجلين
router.use(authController.protect);
router.get('/', transactionsController.getUserTransactions);
router.post('/deposit', transactionsController.createDepositTransaction);
router.post('/gift', transactionsController.giftBalance); // إضافة مسار إهداء الرصيد

// المسارات المحمية للمشرفين فقط
router.use(authController.restrictTo('admin'));
router.get('/all', transactionsController.getAllTransactions);
router.put('/:id', transactionsController.updateTransactionStatus);

// مسارات الإحصائيات
router.get('/analytics/sales', transactionsController.getSalesData);
router.get('/analytics/active-users', transactionsController.getActiveUsersCount);

module.exports = router;
