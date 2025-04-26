
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
const countriesRoutes = require('./routes/countries');
const providersRoutes = require('./routes/providers');
const numbersRoutes = require('./routes/numbers');
const usersRoutes = require('./routes/users');
const transactionsRoutes = require('./routes/transactions');
const manualServicesRoutes = require('./routes/manualServices');
const manualRequestsRoutes = require('./routes/manualRequests');
const supportRoutes = require('./routes/support');
const authRoutes = require('./routes/auth');
const initRoutes = require('./routes/init');

// تسجيل المسارات
app.use('/api/countries', countriesRoutes);
app.use('/api/providers', providersRoutes);
app.use('/api/numbers', numbersRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/manual-services', manualServicesRoutes);
app.use('/api/manual-requests', manualRequestsRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/init', initRoutes);

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
