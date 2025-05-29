
const express = require('express');
const initController = require('../controllers/initController');
const router = express.Router();

// مسار تهيئة النظام
router.post('/', initController.initData);

// مسار الحصول على البيانات المحلية
router.get('/local-data', initController.getLocalData);

// مسار إنشاء المستخدم الإداري
router.post('/admin', initController.createAdmin);

module.exports = router;
