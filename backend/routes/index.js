
const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const usersRoutes = require('./users');
const countriesRoutes = require('./countries');
const providersRoutes = require('./providers');
const numbersRoutes = require('./numbers');
const transactionsRoutes = require('./transactions');
const manualServicesRoutes = require('./manualServices');
const manualRequestsRoutes = require('./manualRequests');
const supportRoutes = require('./support');
const initRoutes = require('./init');
const prepaidCodesRoutes = require('./prepaidCodes');
const adminRoutes = require('./admin'); // Add this line for admin routes

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/countries', countriesRoutes);
router.use('/providers', providersRoutes);
router.use('/numbers', numbersRoutes);
router.use('/transactions', transactionsRoutes);
router.use('/manual-services', manualServicesRoutes);
router.use('/manual-requests', manualRequestsRoutes);
router.use('/support', supportRoutes);
router.use('/init', initRoutes);
router.use('/prepaid-codes', prepaidCodesRoutes);
router.use('/admin', adminRoutes); // Register the admin routes

module.exports = router;
