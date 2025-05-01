
const express = require('express');
const initController = require('../controllers/initController');
const router = express.Router();

router.post('/', initController.initData);
router.get('/local-data', initController.getLocalData);

module.exports = router;
