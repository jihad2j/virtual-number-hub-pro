
const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const userRoutes = require('./users');
const countryRoutes = require('./countries');
const providerRoutes = require('./providers');
const numberRoutes = require('./numbers');
const supportRoutes = require('./support');
const transactionRoutes = require('./transactions');
const manualServiceRoutes = require('./manualServices');
const manualRequestRoutes = require('./manualRequests');
const initRoutes = require('./init');

// Mount the routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/countries', countryRoutes);
router.use('/providers', providerRoutes);
router.use('/numbers', numberRoutes);
router.use('/support', supportRoutes);
router.use('/transactions', transactionRoutes);
router.use('/manual-services', manualServiceRoutes);
router.use('/manual-requests', manualRequestRoutes);
router.use('/init', initRoutes);

module.exports = router;
