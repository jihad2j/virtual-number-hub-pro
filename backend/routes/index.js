
const express = require('express');
const router = express.Router();

// Import all route files
const authRoutes = require('./auth');
const userRoutes = require('./users');
const countryRoutes = require('./countries');
const providerRoutes = require('./providers');
const numberRoutes = require('./numbers');
const transactionRoutes = require('./transactions');
const supportRoutes = require('./support');
const manualServiceRoutes = require('./manualServices');
const manualRequestRoutes = require('./manualRequests');
const adminRoutes = require('./admin');
const initRoutes = require('./init');
const applicationRoutes = require('./applications');

// Map routes to their respective path
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/countries', countryRoutes);
router.use('/providers', providerRoutes);
router.use('/numbers', numberRoutes);
router.use('/transactions', transactionRoutes);
router.use('/support', supportRoutes);
router.use('/manual-services', manualServiceRoutes);
router.use('/manual-requests', manualRequestRoutes);
router.use('/admin', adminRoutes);
router.use('/init', initRoutes);
router.use('/applications', applicationRoutes);

module.exports = router;
