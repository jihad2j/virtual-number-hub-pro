
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const productVisibilityController = require('../controllers/productVisibilityController');

// All routes are protected
router.use(authController.protect);

// User routes - only get visible products
router.get('/visible', productVisibilityController.getVisibleProducts);

// Admin routes
router.use(authController.restrictTo('admin'));
router.get('/', productVisibilityController.getProductVisibilitySettings);
router.post('/', productVisibilityController.createProductVisibility);
router.put('/:id', productVisibilityController.updateProductVisibility);
router.delete('/:id', productVisibilityController.deleteProductVisibility);
router.post('/bulk', productVisibilityController.bulkUpdateProductVisibility);

module.exports = router;
