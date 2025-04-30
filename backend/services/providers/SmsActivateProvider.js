
/**
 * مزود خدمة SMS-Activate
 */
const BaseProvider = require('./BaseProvider');
const axios = require('axios');
const querystring = require('querystring');

class SmsActivateProvider extends BaseProvider {
  /**
   * إنشاء مزود خدمة SMS-Activate جديد
   * @param {string} id معرف المزود في قاعدة البيانات
   * @param {string} apiKey مفتاح API للمزود
   * @param {string} apiUrl عنوان API الخاص بالمزود
   * @param {Object} config إعدادات إضافية
   */
  constructor(id, apiKey, apiUrl, config = {}) {
    super(id, apiKey, apiUrl || 'https://api.sms-activate.org/stubs/handler_api.php', config);
  }

  /**
   * إجراء طلب خاص لـ SMS Activate
   * @param {Object} params المعلمات المطلوبة للطلب
   * @returns {Promise<any>} استجابة API
   */
  async makeSmsActivateRequest(params) {
    // إضافة مفتاح API إلى جميع الطلبات
    params.api_key = this.apiKey;
    
    try {
      const response = await axios({
        method: 'POST',
        url: this.apiUrl,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: querystring.stringify(params),
      });
      
      const text = response.data;
      
      // التعامل مع تنسيقات الاستجابة المختلفة
      if (text.startsWith('ACCESS_NUMBER:')) {
        const [, id, number] = text.split(':');
        return { success: true, id, number };
      } else if (text.startsWith('ACCESS_BALANCE:')) {
        const balance = parseFloat(text.split(':')[1]);
        return { success: true, balance };
      } else if (text.startsWith('STATUS_OK')) {
        return { success: true };
      } else if (text === 'NO_NUMBERS') {
        throw new Error('لا توجد أرقام متاحة');
      } else if (text === 'NO_BALANCE') {
        throw new Error('الرصيد غير كافي');
      } else {
        try {
          // محاولة تحليل الاستجابة كـ JSON إذا كانت منسقة
          return JSON.parse(text);
        } catch (e) {
          return { success: false, message: text };
        }
      }
    } catch (error) {
      console.error('فشل طلب SMS Activate API:', error);
      throw error;
    }
  }

  /**
   * الحصول على الرصيد
   * @returns {Promise<Object>} رصيد الحساب
   */
  async getBalance() {
    try {
      const response = await this.makeSmsActivateRequest({
        action: 'getBalance'
      });
      
      if (response.success && typeof response.balance === 'number') {
        return { balance: response.balance, currency: 'RUB' };
      }
      throw new Error('فشل في الحصول على الرصيد');
    } catch (error) {
      console.error('خطأ في الحصول على رصيد SMS Activate:', error);
      throw new Error(`فشل الحصول على الرصيد: ${error.message}`);
    }
  }

  /**
   * الحصول على قائمة الدول
   * @returns {Promise<Array>} قائمة الدول
   */
  async getCountries() {
    try {
      const response = await this.makeSmsActivateRequest({
        action: 'getCountries'
      });
      
      const countries = [];
      
      for (const [id, countryData] of Object.entries(response)) {
        const data = countryData;
        countries.push({
          id: id,
          name: data.rus || data.eng || `Country ${id}`,
          code: data.iso || '',
          flag: this.getFlagEmoji(data.iso || '')
        });
      }
      
      return countries;
    } catch (error) {
      console.error('خطأ في الحصول على دول SMS Activate:', error);
      throw new Error(`فشل الحصول على قائمة الدول: ${error.message}`);
    }
  }

  /**
   * الحصول على الخدمات المتاحة
   * @param {string} countryId معرف الدولة
   * @returns {Promise<Object>} قائمة الخدمات المتاحة
   */
  async getServices(countryId = '0') {
    try {
      const response = await this.makeSmsActivateRequest({
        action: 'getServices',
        country: countryId
      });
      
      const services = {};
      
      for (const [serviceId, serviceData] of Object.entries(response)) {
        const data = serviceData;
        services[serviceId] = {
          id: serviceId,
          name: serviceId,
          price: parseFloat(data.cost) || 0,
          count: parseInt(data.count) || 0
        };
      }
      
      return services;
    } catch (error) {
      console.error('خطأ في الحصول على خدمات SMS Activate:', error);
      throw new Error(`فشل الحصول على الخدمات: ${error.message}`);
    }
  }

  /**
   * شراء رقم هاتف جديد
   * @param {string} serviceId معرف الخدمة
   * @param {string} countryId معرف الدولة
   * @returns {Promise<Object>} بيانات الرقم الذي تم شراؤه
   */
  async purchaseNumber(serviceId, countryId = '0') {
    try {
      const response = await this.makeSmsActivateRequest({
        action: 'getNumber',
        service: serviceId,
        country: countryId
      });
      
      if (!response.success) {
        throw new Error(response.message || 'فشل في شراء الرقم');
      }
      
      return {
        id: response.id,
        number: response.number,
        country: countryId,
        operator: 'unknown',
        price: 0, // السعر غير متوفر في الاستجابة
        status: 'PENDING'
      };
    } catch (error) {
      console.error('خطأ في شراء رقم SMS Activate:', error);
      throw new Error(`فشل شراء الرقم: ${error.message}`);
    }
  }

  /**
   * التحقق من حالة الرقم
   * @param {string} id معرف الرقم
   * @returns {Promise<Object>} بيانات حالة الرقم
   */
  async checkNumber(id) {
    try {
      const response = await this.makeSmsActivateRequest({
        action: 'getStatus',
        id
      });
      
      let status = 'PENDING';
      let sms = undefined;
      
      if (response.startsWith && response.startsWith('STATUS_OK:')) {
        status = 'RECEIVED';
        const smsText = response.split(':')[1];
        sms = [{
          text: smsText,
          code: this.extractCode(smsText),
          sender: 'unknown',
          date: new Date().toISOString()
        }];
      }
      
      return {
        id,
        number: '',
        country: '',
        operator: '',
        price: 0,
        status,
        sms
      };
    } catch (error) {
      console.error('خطأ في الحصول على حالة رقم SMS Activate:', error);
      throw new Error(`فشل التحقق من حالة الرقم: ${error.message}`);
    }
  }

  /**
   * استخراج رمز من رسالة SMS
   * @param {string} text نص الرسالة
   * @returns {string} الرمز المستخرج
   */
  extractCode(text) {
    // محاولة العثور على تسلسل من 4-6 أرقام قد يكون رمزًا
    const match = text.match(/\b\d{4,6}\b/);
    return match ? match[0] : '';
  }

  /**
   * تحويل رمز الدولة إلى علم emoji
   * @param {string} countryCode رمز الدولة
   * @returns {string} علم emoji
   */
  getFlagEmoji(countryCode) {
    if (!countryCode) return '🌍';
    
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  }
}

module.exports = SmsActivateProvider;
