
/**
 * مصنع لإنشاء كائنات مزودي الخدمة المختلفين
 */
const FiveSimProvider = require('./FiveSimProvider');
const SmsActivateProvider = require('./SmsActivateProvider');
const GetSmsProvider = require('./GetSmsProvider');
const SmsManProvider = require('./SmsManProvider');
const OnlineSmsProvider = require('./OnlineSmsProvider');
const DefaultProvider = require('./DefaultProvider');

class ProviderFactory {
  /**
   * إنشاء كائن مزود خدمة بناءً على النوع
   * @param {Object} providerData بيانات المزود من قاعدة البيانات
   * @returns {Object} كائن مزود الخدمة المناسب
   */
  static createProvider(providerData) {
    // استخراج المعرف والمفتاح ونوع المزود
    const { id, apiKey, type, apiUrl, config } = providerData;

    // إنشاء الكائن المناسب بناءً على نوع المزود
    switch (type) {
      case '5sim':
        return new FiveSimProvider(id, apiKey, apiUrl, config);
      case 'smsactivate':
        return new SmsActivateProvider(id, apiKey, apiUrl, config);
      case 'getsms':
        return new GetSmsProvider(id, apiKey, apiUrl, config);
      case 'smsman':
        return new SmsManProvider(id, apiKey, apiUrl, config);
      case 'onlinesim':
        return new OnlineSmsProvider(id, apiKey, apiUrl, config);
      default:
        return new DefaultProvider(id, apiKey, apiUrl, config);
    }
  }
}

module.exports = ProviderFactory;
