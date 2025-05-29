
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const morgan = require('morgan');

// التكوين
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/masarDB';

// إعداد المشغلات الوسيطة (middleware)
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
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
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// المسار الافتراضي لخطأ 404
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `المسار ${req.originalUrl} غير موجود على هذا الخادم`
  });
});

// معالج الأخطاء العام
app.use((err, req, res, next) => {
  console.error('خطأ في الخادم:', err);
  
  // تحديد رمز الحالة
  let statusCode = err.statusCode || 500;
  let message = err.message || 'حدث خطأ داخلي في الخادم';
  
  // معالجة أخطاء MongoDB
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'معرف غير صالح';
  }
  
  if (err.code === 11000) {
    statusCode = 400;
    message = 'البيانات موجودة مسبقاً';
  }
  
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(e => e.message).join(', ');
  }
  
  res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// تشغيل الخادم
app.listen(PORT, () => {
  console.log(`🚀 الخادم يعمل على المنفذ ${PORT}`);
  console.log(`🌍 البيئة: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 قاعدة البيانات: ${MONGODB_URI}`);
});

// معالجة الإغلاق الصحيح
process.on('SIGTERM', () => {
  console.log('💀 تم استلام SIGTERM. إغلاق الخادم بشكل صحيح...');
  mongoose.connection.close(() => {
    console.log('💀 تم إغلاق اتصال قاعدة البيانات.');
    process.exit(0);
  });
});

module.exports = app;
