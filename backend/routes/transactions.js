
const express = require('express');
const transactionsController = require('../controllers/transactionsController');
const authController = require('../controllers/authController');
const router = express.Router();

// المسارات المحمية للمستخدمين المسجلين
router.use(authController.protect);
router.get('/', transactionsController.getUserTransactions);
router.post('/deposit', transactionsController.createDepositTransaction);

// المسارات المحمية للمشرفين فقط
router.use(authController.restrictTo('admin'));
router.get('/all', transactionsController.getAllTransactions);
router.put('/:id', transactionsController.updateTransactionStatus);

module.exports = router;
