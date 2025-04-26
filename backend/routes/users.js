
const express = require('express');
const usersController = require('../controllers/usersController');
const authController = require('../controllers/authController');
const router = express.Router();

// المسارات المحمية للمشرفين فقط
router.use(authController.protect, authController.restrictTo('admin'));
router.get('/', usersController.getAllUsers);
router.get('/:id', usersController.getUser);
router.post('/', usersController.createUser);
router.put('/:id', usersController.updateUser);
router.delete('/:id', usersController.deleteUser);
router.put('/:id/balance', usersController.updateUserBalance);

module.exports = router;
