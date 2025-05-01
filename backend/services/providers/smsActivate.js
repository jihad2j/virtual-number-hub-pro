
const { BaseProvider } = require('../providerFactory');
const axios = require('axios');

class SmsActivateProvider extends BaseProvider {
  constructor(providerData) {
    super(providerData);
    this.baseUrl = 'https://api.sms-activate.org/stubs/handler_api.php';
  }

  /**
   * Get balance from SMS Activate
   * @returns {Promise<{balance: number, currency: string}>}
   */
  async getBalance() {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          api_key: this.apiKey,
          action: 'getBalance'
        }
      });
      
      // Expected format: ACCESS_BALANCE:10.50
      const balanceRegex = /ACCESS_BALANCE:([\d.]+)/;
      const match = response.data.match(balanceRegex);
      
      if (!match) {
        throw new Error('Invalid balance format');
      }
      
      return {
        balance: parseFloat(match[1]),
        currency: 'RUB'
      };
    } catch (error) {
      console.error('SMS Activate getBalance error:', error.message);
      throw new Error('Failed to get balance from SMS Activate');
    }
  }

  /**
   * Get available countries from SMS Activate
   * @returns {Promise<Array>}
   */
  async getCountries() {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          api_key: this.apiKey,
          action: 'getCountries'
        }
      });
      
      // Format countries to match our schema
      return Object.entries(response.data).map(([id, data]) => ({
        id: id,
        name: data.eng,
        code: data.iso,
        iso: data.iso,
        flag: this.getFlagEmoji(data.iso)
      }));
    } catch (error) {
      console.error('SMS Activate getCountries error:', error.message);
      throw new Error('Failed to get countries from SMS Activate');
    }
  }

  /**
   * Get available services for a country
   * @param {string} countryCode - Country code
   * @returns {Promise<Array>}
   */
  async getServices(countryCode) {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          api_key: this.apiKey,
          action: 'getNumbersStatus',
          country: countryCode
        }
      });
      
      // Format services to match our schema
      return Object.entries(response.data).map(([serviceCode, count]) => ({
        id: serviceCode,
        name: this.getServiceName(serviceCode),
        count: count,
        available: count > 0
      }));
    } catch (error) {
      console.error('SMS Activate getServices error:', error.message);
      throw new Error(`Failed to get services for country ${countryCode} from SMS Activate`);
    }
  }

  /**
   * Purchase a phone number
   * @param {Object} options - Purchase options
   * @returns {Promise<Object>}
   */
  async purchaseNumber(options) {
    try {
      const { countryCode, service } = options;
      
      const response = await axios.get(this.baseUrl, {
        params: {
          api_key: this.apiKey,
          action: 'getNumber',
          service: service,
          country: countryCode
        }
      });
      
      // Expected format: ACCESS_NUMBER:12345:79251234567
      const numberRegex = /ACCESS_NUMBER:(\d+):(\d+)/;
      const match = response.data.match(numberRegex);
      
      if (!match) {
        throw new Error(`Invalid response format: ${response.data}`);
      }
      
      const id = match[1];
      const number = match[2];
      
      return {
        id: id.toString(),
        number: number,
        country: countryCode,
        service: service,
        status: 'pending',
        expiresAt: new Date(Date.now() + 20 * 60 * 1000).toISOString(), // 20 minutes expiration
        smsCode: null,
        providerData: { id, number }
      };
    } catch (error) {
      console.error('SMS Activate purchaseNumber error:', error.message);
      throw new Error('Failed to purchase number from SMS Activate');
    }
  }

  /**
   * Check number status
   * @param {string} id - Number ID
   * @returns {Promise<Object>}
   */
  async checkNumber(id) {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          api_key: this.apiKey,
          action: 'getStatus',
          id: id
        }
      });
      
      // Process different status responses
      const statusRegex = /STATUS_([A-Z_]+)(?::(.+))?/;
      const match = response.data.match(statusRegex);
      
      if (!match) {
        throw new Error(`Invalid status format: ${response.data}`);
      }
      
      const status = match[1];
      const smsCode = match[2] || null;
      
      return {
        id: id,
        status: this.mapStatus(status),
        smsCode: smsCode,
        providerData: { status, smsCode }
      };
    } catch (error) {
      console.error('SMS Activate checkNumber error:', error.message);
      throw new Error(`Failed to check number status for ID ${id} from SMS Activate`);
    }
  }

  /**
   * Cancel a number
   * @param {string} id - Number ID
   * @returns {Promise<boolean>}
   */
  async cancelNumber(id) {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          api_key: this.apiKey,
          action: 'setStatus',
          status: 8, // 8 = cancel activation
          id: id
        }
      });
      
      return response.data === 'ACCESS_CANCEL';
    } catch (error) {
      console.error('SMS Activate cancelNumber error:', error.message);
      throw new Error(`Failed to cancel number for ID ${id} from SMS Activate`);
    }
  }

  /**
   * Map SMS Activate status to our status format
   * @param {string} status
   * @returns {string}
   */
  mapStatus(status) {
    const statusMap = {
      'WAIT_CODE': 'pending',
      'WAIT_RETRY': 'pending',
      'WAIT_RESEND': 'pending',
      'OK': 'completed',
      'CANCEL': 'cancelled'
    };
    
    return statusMap[status] || 'pending';
  }

  /**
   * Map service code to human-readable name
   * @param {string} serviceCode
   * @returns {string}
   */
  getServiceName(serviceCode) {
    const serviceMap = {
      'vk': 'VKontakte',
      'ok': 'Odnoklassniki',
      'wa': 'WhatsApp',
      'vi': 'Viber',
      'tg': 'Telegram',
      'fb': 'Facebook',
      'tw': 'Twitter',
      'go': 'Google',
      'ins': 'Instagram',
      // Add more mappings as needed
    };
    
    return serviceMap[serviceCode] || serviceCode;
  }

  /**
   * Helper function to get flag emoji
   * @param {string} countryCode
   * @returns {string}
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
