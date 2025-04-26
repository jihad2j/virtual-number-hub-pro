
const Country = require('../models/Country');
const Provider = require('../models/Provider');
const User = require('../models/User');
const ManualService = require('../models/ManualService');
const catchAsync = require('../utils/catchAsync');

// بيانات مبدئية للدول
const mockCountries = [
  { name: 'المملكة العربية السعودية', flag: '🇸🇦', code: 'sa', available: true },
  { name: 'الإمارات العربية المتحدة', flag: '🇦🇪', code: 'ae', available: true },
  { name: 'مصر', flag: '🇪🇬', code: 'eg', available: true },
  { name: 'قطر', flag: '🇶🇦', code: 'qa', available: true },
  { name: 'الكويت', flag: '🇰🇼', code: 'kw', available: true },
  { name: 'عمان', flag: '🇴🇲', code: 'om', available: true },
  { name: 'البحرين', flag: '🇧🇭', code: 'bh', available: true },
  { name: 'الأردن', flag: '🇯🇴', code: 'jo', available: true },
  { name: 'لبنان', flag: '🇱🇧', code: 'lb', available: false },
  { name: 'المغرب', flag: '🇲🇦', code: 'ma', available: true },
];

// تهيئة البيانات الأولية
exports.initData = catchAsync(async (req, res, next) => {
  // التحقق من وجود بيانات
  const countriesCount = await Country.countDocuments();
  const providersCount = await Provider.countDocuments();
  const usersCount = await User.countDocuments();
  const servicesCount = await ManualService.countDocuments();
  
  let initialized = false;
  
  // إذا لم تكن هناك بيانات، قم بإنشاء البيانات الأولية
  if (countriesCount === 0) {
    await Country.insertMany(mockCountries);
    initialized = true;
  }
  
  if (providersCount === 0) {
    // الحصول على معرفات الدول المضافة
    const countries = await Country.find().select('_id');
    const countryIds = countries.map(country => country._id);
    
    await Provider.insertMany([
      {
        name: '5Sim',
        logo: '/assets/5sim-logo.png',
        description: 'المزود الرئيسي للأرقام الافتراضية',
        countries: countryIds.slice(0, 5),
        isActive: true,
        apiKey: process.env.FIVESIM_API_KEY || 'eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NzUwNzkzNjEsImlhdCI6MTc0MzU0MzM2MSwicmF5IjoiYzViYjRjNWNiZjA0N2U2OTI1OWI0YWUzOTM0MmQ1YjQiLCJzdWIiOjEyODQ5OTF9.b1IL-DlhrrOMhcAnq6pxoucrlboVoSbDbjZAI1kcIV63lAr9Kk0WvmE5KQf8a0WH1nkbGZR71i8sCRxCloIVGp08RFVFGsYpSos7flQtzoZs6_TPbuhwJoJKYgPKjNMZVT1Vi9_ywMGRBuOvsbBn6qcAGOCRLKByGuW8PwS7pxmmJbvsB3HD40ek5vFTHpFTxEwVz4OpAOjbmq-Aj6Vz-bz8ymndpIm6D2yGBhRV9aQ4yRrrG-zHZfA-1ayd6vQz969aQIK6sM2tsXRrPKO-hpbF4f7vtsg-RX41DqcZy3t2BWnlB2JwvTB_lLlrm_al0J4k-pqr6lR9TnjsJ3WXBg',
        apiUrl: 'https://5sim.net/v1'
      },
      {
        name: 'SMSActivate',
        logo: '/assets/sms-activate-logo.png',
        description: 'خدمة أرقام للتفعيل',
        countries: countryIds.slice(0, 6),
        isActive: true,
        apiKey: process.env.SMS_ACTIVATE_API_KEY || '89b3e2eeA774ffbcdbe2e4d81fcc4408',
        apiUrl: 'https://api.sms-activate.org/stubs/handler_api.php'
      }
    ]);
    initialized = true;
  }
  
  if (usersCount === 0) {
    await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
      balance: 1000,
      isActive: true
    });
    
    await User.create({
      username: 'user',
      email: 'user@example.com',
      password: 'user123',
      role: 'user',
      balance: 50,
      isActive: true
    });
    initialized = true;
  }
  
  if (servicesCount === 0) {
    await ManualService.insertMany([
      {
        name: 'تفعيل واتساب',
        description: 'خدمة تفعيل حساب واتساب برقم افتراضي',
        price: 5,
        available: true
      },
      {
        name: 'تفعيل تليجرام',
        description: 'خدمة تفعيل حساب تليجرام برقم افتراضي',
        price: 4,
        available: true
      }
    ]);
    initialized = true;
  }
  
  res.status(200).json({
    status: 'success',
    message: initialized 
      ? 'تم تهيئة البيانات الأولية بنجاح' 
      : 'البيانات الأولية موجودة بالفعل'
  });
});
