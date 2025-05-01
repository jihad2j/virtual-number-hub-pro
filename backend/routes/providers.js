
const express = require('express');
const providersController = require('../controllers/providersController');
const authController = require('../controllers/authController');
const router = express.Router();

// المسارات العامة
router.get('/', providersController.getAllProviders);
router.get('/:id', providersController.getProvider);

// المسارات المحمية (تتطلب تسجيل الدخول)
router.use(authController.protect);

// مسارات التفاعل مع API الخاص بمزود الخدمة
router.get('/:id/balance', providersController.getProviderBalance);
router.get('/:id/countries', providersController.getProviderCountries);
router.get('/:id/services/:countryId', providersController.getProviderServices);
router.post('/:id/purchase', providersController.purchaseNumber);
router.get('/:id/check/:numberId', providersController.checkNumber);
router.get('/:id/test-connection', providersController.testConnection);

// المسارات المحمية للمشرفين فقط
router.use(authController.restrictTo('admin'));
router.post('/', providersController.createProvider);
router.put('/:id', providersController.updateProvider);
router.delete('/:id', providersController.deleteProvider);

module.exports = router;
