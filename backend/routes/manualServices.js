
const express = require('express');
const manualServicesController = require('../controllers/manualServicesController');
const authController = require('../controllers/authController');
const router = express.Router();

// المسارات العامة
router.get('/', manualServicesController.getAllManualServices);
router.get('/:id', manualServicesController.getManualService);

// المسارات المحمية للمشرفين فقط
router.use(authController.protect, authController.restrictTo('admin'));
router.post('/', manualServicesController.createManualService);
router.put('/:id', manualServicesController.updateManualService);
router.delete('/:id', manualServicesController.deleteManualService);

module.exports = router;
