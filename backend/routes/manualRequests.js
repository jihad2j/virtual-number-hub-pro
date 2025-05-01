
const express = require('express');
const manualRequestsController = require('../controllers/manualRequestsController');
const authController = require('../controllers/authController');
const router = express.Router();

// المسارات المحمية للمستخدمين المسجلين
router.use(authController.protect);
router.get('/my', manualRequestsController.getUserManualRequests);
router.post('/', manualRequestsController.createManualRequest);
router.put('/:id/confirm', manualRequestsController.confirmManualRequest);

// المسارات المحمية للمشرفين فقط
router.use(authController.restrictTo('admin'));
router.get('/', manualRequestsController.getAllManualRequests);
router.put('/:id/respond', manualRequestsController.respondToManualRequest);
router.put('/:id/status', manualRequestsController.updateManualRequestStatus);

module.exports = router;
