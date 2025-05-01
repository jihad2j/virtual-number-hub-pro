
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');

// التكوين
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/masarDB';

// إعداد المشغلات الوسيطة (middleware)
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// تكوين الاتصال بقاعدة البيانات
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ تم الاتصال بقاعدة البيانات MongoDB بنجاح');
  })
  .catch((err) => {
    console.error('❌ فشل الاتصال بقاعدة البيانات:', err);
  });

// تضمين المسارات
const routes = require('./routes');

// استخدام المسارات من الملف الرئيسي للمسارات
app.use('/api', routes);

// مسار اختبار لفحص الخادم
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'الخادم يعمل بشكل طبيعي',
    timestamp: new Date()
  });
});

// المسار الافتراضي لخطأ 404
app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: 'المسار المطلوب غير موجود'
  });
});

// معالج الأخطاء
app.use((err, req, res, next) => {
  console.error('خطأ في الخادم:', err);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'حدث خطأ في الخادم',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// تشغيل الخادم
app.listen(PORT, () => {
  console.log(`🚀 الخادم يعمل على المنفذ ${PORT}`);
});

module.exports = app;
