
import { apiClient } from '@/services/apiClient';

/**
 * خدمة لإدارة التفاعل مع مزودي الخدمة من خلال واجهة API
 */
export const providerService = {
  /**
   * اختبار الاتصال بمزود الخدمة
   * @param {string} providerId - معرف مزود الخدمة
   * @returns {Promise<boolean>} - نجاح أو فشل الاتصال
   */
  async testConnection(providerId: string): Promise<boolean> {
    try {
      const response = await apiClient.get(`/providers/${providerId}/test-connection`);
      return response.data.connected;
    } catch (error) {
      console.error('فشل اختبار الاتصال بمزود الخدمة:', error);
      return false;
    }
  },

  /**
   * الحصول على رصيد مزود الخدمة
   * @param {string} providerId - معرف مزود الخدمة
   * @returns {Promise<{balance: number; currency: string}>} - الرصيد والعملة
   */
  async getBalance(providerId: string): Promise<{ balance: number; currency: string }> {
    const response = await apiClient.get(`/providers/${providerId}/balance`);
    return response.data.data;
  },

  /**
   * الحصول على الدول المتاحة من مزود الخدمة
   * @param {string} providerId - معرف مزود الخدمة
   * @returns {Promise<any[]>} - قائمة الدول المتاحة
   */
  async getCountries(providerId: string): Promise<any[]> {
    const response = await apiClient.get(`/providers/${providerId}/countries`);
    return response.data.data;
  },

  /**
   * الحصول على الخدمات المتاحة لدولة معينة من مزود الخدمة
   * @param {string} providerId - معرف مزود الخدمة
   * @param {string} countryCode - رمز الدولة
   * @returns {Promise<any[]>} - قائمة الخدمات المتاحة
   */
  async getServices(providerId: string, countryCode: string): Promise<any[]> {
    const response = await apiClient.get(`/providers/${providerId}/services/${countryCode}`);
    return response.data.data;
  },

  /**
   * شراء رقم هاتف من مزود الخدمة
   * @param {string} providerId - معرف مزود الخدمة
   * @param {string} countryCode - رمز الدولة
   * @param {string} service - رمز الخدمة
   * @returns {Promise<any>} - معلومات الرقم المشتراة
   */
  async purchaseNumber(providerId: string, countryCode: string, service: string): Promise<any> {
    const response = await apiClient.post('/numbers/purchase', { providerId, countryCode, service });
    return response.data.data;
  },

  /**
   * التحقق من حالة الرقم
   * @param {string} id - معرف الرقم
   * @returns {Promise<any>} - حالة الرقم
   */
  async checkNumber(id: string): Promise<any> {
    const response = await apiClient.get(`/numbers/${id}/check`);
    return response.data.data;
  },

  /**
   * إلغاء رقم
   * @param {string} id - معرف الرقم
   * @returns {Promise<boolean>} - نجاح أو فشل الإلغاء
   */
  async cancelNumber(id: string): Promise<boolean> {
    const response = await apiClient.post(`/numbers/${id}/cancel`);
    return response.data.success;
  }
};
