
const express = require('express');
const providersController = require('../controllers/providersController');
const authController = require('../controllers/authController');
const router = express.Router();

// المسارات العامة
router.get('/', providersController.getAllProviders);
router.get('/:id', providersController.getProvider);

// المسارات المحمية للمستخدمين المسجلين
router.use(authController.protect);

// مسارات خاصة بمزودي الخدمة - متاحة للمستخدمين أيضًا
router.get('/:id/test-connection', providersController.testProviderConnection);
router.get('/:id/balance', providersController.getProviderBalance);
router.get('/:id/countries', providersController.getProviderCountries);
router.get('/:id/services/:countryCode', providersController.getProviderServices);

// المسارات المحمية للمشرفين فقط
router.use(authController.restrictTo('admin'));
router.post('/', providersController.createProvider);
router.put('/:id', providersController.updateProvider);
router.delete('/:id', providersController.deleteProvider);

module.exports = router;
