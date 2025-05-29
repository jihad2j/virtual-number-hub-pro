
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

// إدارة التطبيقات الأساسية (الأسماء فقط)
router.get('/', applicationsController.getAllApplications);
router.post('/', applicationsController.addBaseApplication);
router.put('/:id', applicationsController.updateBaseApplication);
router.delete('/:id', applicationsController.deleteBaseApplication);

// إدارة تطبيقات المستخدمين (مع السيرفرات والأسعار)
router.post('/user', applicationsController.addUserApplication);
router.put('/user/:id', applicationsController.updateUserApplication);
router.delete('/user/:id', applicationsController.deleteUserApplication);

module.exports = router;
