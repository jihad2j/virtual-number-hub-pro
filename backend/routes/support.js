
const express = require('express');
const supportController = require('../controllers/supportController');
const authController = require('../controllers/authController');
const router = express.Router();

// المسارات المحمية للمستخدمين المسجلين
router.use(authController.protect);
router.get('/user', supportController.getUserTickets);
router.post('/', supportController.createTicket);
router.post('/:id/respond', supportController.respondToTicket);
router.put('/:id/close', supportController.closeTicket);

// المسارات المحمية للمشرفين فقط
router.use(authController.restrictTo('admin'));
router.get('/', supportController.getAllTickets);
router.put('/:id/status', supportController.updateTicketStatus);

module.exports = router;
