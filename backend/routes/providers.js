
const express = require('express');
const providersController = require('../controllers/providersController');
const authController = require('../controllers/authController');
const router = express.Router();

// المسارات العامة
router.get('/', providersController.getAllProviders);
router.get('/:id', providersController.getProvider);

// المسارات المحمية للمشرفين فقط
router.use(authController.protect, authController.restrictTo('admin'));
router.post('/', providersController.createProvider);
router.put('/:id', providersController.updateProvider);
router.delete('/:id', providersController.deleteProvider);

module.exports = router;
