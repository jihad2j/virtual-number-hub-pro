
import { apiClient } from '@/services/apiClient';
import { PhoneNumber } from '@/types/PhoneNumber';

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
      // Check if providerId is a MongoDB ObjectId (24 hex chars) or a provider code
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(providerId);
      const endpoint = isObjectId 
        ? `/providers/${providerId}/test-connection` 
        : `/providers/code/${providerId}/test-connection`;
      
      const response = await apiClient.get(endpoint);
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
    // Check if providerId is a MongoDB ObjectId (24 hex chars) or a provider code
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(providerId);
    const endpoint = isObjectId 
      ? `/providers/${providerId}/balance` 
      : `/providers/code/${providerId}/balance`;
      
    const response = await apiClient.get(endpoint);
    return response.data.data;
  },

  /**
   * الحصول على الدول المتاحة من مزود الخدمة
   * @param {string} providerId - معرف مزود الخدمة
   * @returns {Promise<any[]>} - قائمة الدول المتاحة
   */
  async getCountries(providerId: string): Promise<any[]> {
    // Check if providerId is a MongoDB ObjectId (24 hex chars) or a provider code
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(providerId);
    const endpoint = isObjectId 
      ? `/providers/${providerId}/countries` 
      : `/providers/code/${providerId}/countries`;
      
    const response = await apiClient.get(endpoint);
    return response.data.data;
  },

  /**
   * الحصول على الخدمات المتاحة لدولة معينة من مزود الخدمة
   * @param {string} providerId - معرف مزود الخدمة
   * @param {string} countryCode - رمز الدولة
   * @returns {Promise<any[]>} - قائمة الخدمات المتاحة
   */
  async getServices(providerId: string, countryCode: string): Promise<any[]> {
    // Check if providerId is a MongoDB ObjectId (24 hex chars) or a provider code
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(providerId);
    const endpoint = isObjectId 
      ? `/providers/${providerId}/services/${countryCode}` 
      : `/providers/code/${providerId}/services/${countryCode}`;
      
    const response = await apiClient.get(endpoint);
    return response.data.data;
  },

  /**
   * شراء رقم هاتف من مزود الخدمة
   * @param {string} providerId - معرف مزود الخدمة
   * @param {string} countryCode - رمز الدولة
   * @param {string} service - رمز الخدمة
   * @returns {Promise<PhoneNumber>} - معلومات الرقم المشتراة
   */
  async purchaseNumber(providerId: string, countryCode: string, service: string): Promise<PhoneNumber> {
    const response = await apiClient.post('/numbers/purchase', { providerId, countryCode, service });
    return response.data.data;
  },

  /**
   * التحقق من حالة الرقم
   * @param {string} id - معرف الرقم
   * @returns {Promise<PhoneNumber>} - حالة الرقم
   */
  async checkNumber(id: string): Promise<PhoneNumber> {
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
