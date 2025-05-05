
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const prepaidCodesController = require('../controllers/prepaidCodesController');

// Get all prepaid codes (admin only)
router.get('/', auth, admin, prepaidCodesController.getAllPrepaidCodes);

// Generate prepaid codes (admin only)
router.post('/generate', auth, admin, prepaidCodesController.generatePrepaidCodes);

// Redeem a prepaid code (authenticated user)
router.post('/redeem', auth, prepaidCodesController.redeemPrepaidCode);

// Delete a prepaid code (admin only)
router.delete('/:id', auth, admin, prepaidCodesController.deletePrepaidCode);

module.exports = router;
