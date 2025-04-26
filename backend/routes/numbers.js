
const express = require('express');
const numbersController = require('../controllers/numbersController');
const authController = require('../controllers/authController');
const router = express.Router();

// المسارات المحمية للمستخدمين المسجلين
router.use(authController.protect);
router.get('/country/:countryId', numbersController.getNumbersByCountry);
router.post('/purchase/:numberId', numbersController.purchaseNumber);
router.get('/user', numbersController.getUserNumbers);

// المسارات المحمية للمشرفين فقط
router.use(authController.restrictTo('admin'));
router.post('/', numbersController.createNumber);
router.put('/:id', numbersController.updateNumber);
router.delete('/:id', numbersController.deleteNumber);

module.exports = router;
