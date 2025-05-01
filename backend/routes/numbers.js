
const express = require('express');
const numbersController = require('../controllers/numbersController');
const authController = require('../controllers/authController');
const router = express.Router();

// جميع المسارات محمية للمستخدمين المسجلين
router.use(authController.protect);

// مسارات المستخدمين
router.get('/my', numbersController.getUserNumbers);
router.post('/purchase', numbersController.purchaseNumber);
router.get('/:id/check', numbersController.checkNumber);
router.post('/:id/cancel', numbersController.cancelNumber);

// مسارات المشرفين
router.use(authController.restrictTo('admin'));
router.get('/', numbersController.getAllNumbers);

module.exports = router;
