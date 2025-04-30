
const express = require('express');
const prepaidCodesController = require('../controllers/prepaidCodesController');
const authController = require('../controllers/authController');
const router = express.Router();

// المسارات المحمية للمستخدمين المسجلين
router.use(authController.protect);

// استخدام كود الشحن متاح لجميع المستخدمين المسجلين
router.post('/redeem', prepaidCodesController.redeemPrepaidCode);

// المسارات المحمية للمشرفين فقط
router.use(authController.restrictTo('admin'));
router.get('/', prepaidCodesController.getAllPrepaidCodes);
router.post('/generate', prepaidCodesController.generatePrepaidCodes);
router.delete('/:id', prepaidCodesController.deletePrepaidCode);

module.exports = router;
