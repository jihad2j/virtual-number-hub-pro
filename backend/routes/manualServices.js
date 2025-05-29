
const express = require('express');
const manualServicesController = require('../controllers/manualServicesController');
const authController = require('../controllers/authController');
const router = express.Router();

// المسارات العامة للمستخدمين المسجلين
router.use(authController.protect);
router.get('/', manualServicesController.getAllManualServices);
router.get('/:id', manualServicesController.getManualService);

// المسارات المحمية للمشرفين فقط
router.use(authController.restrictTo('admin'));
router.post('/', manualServicesController.createManualService);
router.patch('/:id', manualServicesController.updateManualService);
router.delete('/:id', manualServicesController.deleteManualService);

module.exports = router;
