
/**
 * الفئة الأساسية لكل مزودي الخدمة
 */
const axios = require('axios');

class BaseProvider {
  /**
   * إنشاء مزود خدمة جديد
   * @param {string} id معرف المزود في قاعدة البيانات
   * @param {string} apiKey مفتاح API للمزود
   * @param {string} apiUrl عنوان API الخاص بالمزود
   * @param {Object} config إعدادات إضافية خاصة بالمزود
   */
  constructor(id, apiKey, apiUrl, config = {}) {
    this.id = id;
    this.apiKey = apiKey;
    this.apiUrl = apiUrl;
    this.config = config;
  }

  /**
   * الحصول على رصيد الحساب
   * @returns {Promise<Object>} رصيد الحساب
   */
  async getBalance() {
    throw new Error('يجب تنفيذ هذه الدالة في الفئة الفرعية');
  }

  /**
   * الحصول على قائمة الدول المتاحة
   * @returns {Promise<Array>} قائمة الدول
   */
  async getCountries() {
    throw new Error('يجب تنفيذ هذه الدالة في الفئة الفرعية');
  }

  /**
   * الحصول على قائمة الخدمات المتاحة
   * @param {string} countryId معرف الدولة
   * @returns {Promise<Array>} قائمة الخدمات
   */
  async getServices(countryId) {
    throw new Error('يجب تنفيذ هذه الدالة في الفئة الفرعية');
  }

  /**
   * شراء رقم هاتف جديد
   * @param {string} serviceId معرف الخدمة
   * @param {string} countryId معرف الدولة
   * @returns {Promise<Object>} بيانات الرقم الذي تم شراؤه
   */
  async purchaseNumber(serviceId, countryId) {
    throw new Error('يجب تنفيذ هذه الدالة في الفئة الفرعية');
  }

  /**
   * التحقق من حالة الرقم
   * @param {string} numberId معرف الرقم
   * @returns {Promise<Object>} بيانات حالة الرقم
   */
  async checkNumber(numberId) {
    throw new Error('يجب تنفيذ هذه الدالة في الفئة الفرعية');
  }
  
  /**
   * إجراء طلب HTTP
   * @param {string} method طريقة HTTP (GET, POST, etc.)
   * @param {string} url المسار النسبي
   * @param {Object} data البيانات المرسلة (للطلبات POST و PUT)
   * @param {Object} headers الرؤوس الإضافية
   * @returns {Promise<Object>} البيانات المستلمة من الخادم
   */
  async makeRequest(method, url, data = null, headers = {}) {
    try {
      const response = await axios({
        method,
        url: `${this.apiUrl}${url}`,
        data,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error(`خطأ في طلب API لـ ${this.constructor.name}:`, error.message);
      throw new Error(`فشل الاتصال بمزود الخدمة: ${error.message}`);
    }
  }
}

module.exports = BaseProvider;
