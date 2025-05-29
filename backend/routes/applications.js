
const express = require('express');
const applicationsController = require('../controllers/applicationsController');
const authController = require('../controllers/authController');
const router = express.Router();

// المسارات المحمية للمستخدمين المسجلين
router.use(authController.protect);

// مسارات المستخدمين
router.get('/user', applicationsController.getUserApplications);
router.post('/purchase', applicationsController.purchaseApplication);

// المسارات المحمية للمشرفين فقط
router.use(authController.restrictTo('admin'));
router.get('/', applicationsController.getAllApplications);
router.post('/user', applicationsController.addUserApplication);
router.put('/:id', applicationsController.updateUserApplication);
router.delete('/:id', applicationsController.deleteUserApplication);

module.exports = router;
