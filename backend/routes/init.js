
const express = require('express');
const initController = require('../controllers/initController');
const router = express.Router();

router.post('/', initController.initData);

module.exports = router;
