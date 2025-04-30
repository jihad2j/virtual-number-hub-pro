
/**
 * مزود خدمة 5sim
 */
const BaseProvider = require('./BaseProvider');

class FiveSimProvider extends BaseProvider {
  /**
   * إنشاء مزود خدمة 5sim جديد
   * @param {string} id معرف المزود في قاعدة البيانات
   * @param {string} apiKey مفتاح API للمزود
   * @param {string} apiUrl عنوان API الخاص بالمزود
   * @param {Object} config إعدادات إضافية
   */
  constructor(id, apiKey, apiUrl, config = {}) {
    super(id, apiKey, apiUrl || 'https://5sim.net/v1', config);
  }

  /**
   * الحصول على الرصيد
   * @returns {Promise<Object>} رصيد الحساب
   */
  async getBalance() {
    try {
      const profile = await this.makeRequest('GET', '/user/profile', null, {
        Authorization: `Bearer ${this.apiKey}`
      });
      return { balance: profile.balance, currency: 'RUB' };
    } catch (error) {
      console.error('خطأ في الحصول على الرصيد من 5sim:', error);
      throw new Error(`فشل الحصول على الرصيد: ${error.message}`);
    }
  }

  /**
   * الحصول على قائمة الدول المتاحة
   * @returns {Promise<Array>} قائمة الدول
   */
  async getCountries() {
    try {
      const response = await this.makeRequest('GET', '/guest/countries');
      const countries = [];
      
      // تحويل البيانات المتداخلة إلى مصفوفة من كائنات الدول
      for (const [countryCode, countryData] of Object.entries(response)) {
        const countryInfo = countryData;
        if (countryInfo.text_en && countryInfo.iso) {
          const isoCode = Object.keys(countryInfo.iso)[0];
          const prefix = Object.keys(countryInfo.prefix)[0] || '';
          
          countries.push({
            id: countries.length + 1,
            name: countryInfo.text_en,
            iso: isoCode,
            flag: this.getFlagEmoji(isoCode),
            prefix: prefix
          });
        }
      }
      
      return countries;
    } catch (error) {
      console.error('خطأ في الحصول على قائمة الدول من 5sim:', error);
      throw new Error(`فشل الحصول على قائمة الدول: ${error.message}`);
    }
  }

  /**
   * الحصول على الخدمات المتاحة لدولة معينة
   * @param {string} country رمز الدولة
   * @param {string} operator مشغل الاتصالات (افتراضيًا "any")
   * @returns {Promise<Object>} قائمة الخدمات المتاحة
   */
  async getServices(country, operator = "any") {
    try {
      return await this.makeRequest('GET', `/guest/products/${country}/${operator}`, null, {
        Authorization: `Bearer ${this.apiKey}`
      });
    } catch (error) {
      console.error(`خطأ في الحصول على الخدمات من 5sim للدولة ${country}:`, error);
      throw new Error(`فشل الحصول على الخدمات: ${error.message}`);
    }
  }

  /**
   * شراء رقم هاتف جديد
   * @param {string} country رمز الدولة
   * @param {string} operator المشغل (افتراضيًا "any")
   * @param {string} product اسم الخدمة/التطبيق
   * @returns {Promise<Object>} بيانات الرقم الذي تم شراؤه
   */
  async purchaseNumber(product, country, operator = "any") {
    try {
      return await this.makeRequest('GET', `/user/buy/activation/${country}/${operator}/${product}`, null, {
        Authorization: `Bearer ${this.apiKey}`
      });
    } catch (error) {
      console.error(`خطأ في شراء رقم من 5sim:`, error);
      throw new Error(`فشل شراء الرقم: ${error.message}`);
    }
  }

  /**
   * التحقق من حالة الرقم
   * @param {number} id معرف الرقم في 5sim
   * @returns {Promise<Object>} بيانات الرقم المحدث
   */
  async checkNumber(id) {
    try {
      return await this.makeRequest('GET', `/user/check/${id}`, null, {
        Authorization: `Bearer ${this.apiKey}`
      });
    } catch (error) {
      console.error(`خطأ في التحقق من حالة الرقم من 5sim:`, error);
      throw new Error(`فشل التحقق من حالة الرقم: ${error.message}`);
    }
  }

  /**
   * تحويل رمز الدولة إلى علم emoji
   * @param {string} countryCode رمز الدولة
   * @returns {string} علم emoji
   */
  getFlagEmoji(countryCode) {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  }
}

module.exports = FiveSimProvider;
