
const express = require('express');
const countriesController = require('../controllers/countriesController');
const authController = require('../controllers/authController');
const router = express.Router();

// المسارات العامة
router.get('/', countriesController.getAllCountries);
router.get('/available', countriesController.getAvailableCountries);
router.get('/:id', countriesController.getCountry);

// المسارات المحمية للمشرفين فقط
router.use(authController.protect, authController.restrictTo('admin'));
router.post('/', countriesController.createCountry);
router.post('/bulk', countriesController.createBulkCountries);
router.put('/:id', countriesController.updateCountry);
router.delete('/:id', countriesController.deleteCountry);

module.exports = router;
