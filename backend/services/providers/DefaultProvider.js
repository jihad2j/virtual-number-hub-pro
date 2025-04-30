
/**
 * مزود خدمة افتراضي
 */
const BaseProvider = require('./BaseProvider');

class DefaultProvider extends BaseProvider {
  /**
   * الحصول على الرصيد
   * @returns {Promise<Object>} رصيد الحساب
   */
  async getBalance() {
    return { balance: 0, currency: 'USD' };
  }

  /**
   * الحصول على قائمة الدول المتاحة
   * @returns {Promise<Array>} قائمة الدول
   */
  async getCountries() {
    return [];
  }

  /**
   * الحصول على قائمة الخدمات المتاحة
   * @param {string} countryId معرف الدولة
   * @returns {Promise<Array>} قائمة الخدمات
   */
  async getServices(countryId) {
    return [];
  }

  /**
   * شراء رقم هاتف جديد
   * @param {string} serviceId معرف الخدمة
   * @param {string} countryId معرف الدولة
   * @returns {Promise<Object>} بيانات الرقم الذي تم شراؤه
   */
  async purchaseNumber(serviceId, countryId) {
    throw new Error('هذا المزود لا يدعم شراء الأرقام');
  }

  /**
   * التحقق من حالة الرقم
   * @param {string} numberId معرف الرقم
   * @returns {Promise<Object>} بيانات حالة الرقم
   */
  async checkNumber(numberId) {
    throw new Error('هذا المزود لا يدعم التحقق من حالة الرقم');
  }
}

module.exports = DefaultProvider;
