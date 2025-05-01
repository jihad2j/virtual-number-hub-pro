
const axios = require('axios');
const { BaseProvider } = require('../providerFactory');

class SmsManProvider extends BaseProvider {
  constructor(providerData) {
    super(providerData);
    this.baseUrl = providerData.apiUrl || 'https://api.sms-man.com/control';
  }

  /**
   * Get balance from SmsMan
   * @returns {Promise<{balance: number, currency: string}>}
   */
  async getBalance() {
    try {
      const response = await axios.get(`${this.baseUrl}/get-balance`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json',
        }
      });
      
      return {
        balance: response.data.balance || 0,
        currency: 'RUB'
      };
    } catch (error) {
      console.error('SmsMan getBalance error:', error.message);
      throw new Error('Failed to get balance from SmsMan');
    }
  }

  /**
   * Get available countries from SmsMan
   * @returns {Promise<Array>}
   */
  async getCountries() {
    try {
      const response = await axios.get(`${this.baseUrl}/countries`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json',
        }
      });
      
      // Format countries to match our schema
      return response.data.map(country => ({
        id: country.id.toString(),
        name: country.name,
        code: country.iso,
        iso: country.iso,
        flag: this.getFlagEmoji(country.iso)
      }));
    } catch (error) {
      console.error('SmsMan getCountries error:', error.message);
      throw new Error('Failed to get countries from SmsMan');
    }
  }

  /**
   * Get available services for a country
   * @param {string} countryCode - Country code
   * @returns {Promise<Array>}
   */
  async getServices(countryCode) {
    try {
      // Get country ID first
      const countries = await this.getCountries();
      const country = countries.find(c => c.code.toLowerCase() === countryCode.toLowerCase());
      
      if (!country) {
        throw new Error(`Country not found: ${countryCode}`);
      }
      
      const response = await axios.get(`${this.baseUrl}/applications`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json',
        },
        params: {
          country_id: country.id
        }
      });
      
      // Format services to match our schema
      return response.data.map(app => ({
        id: app.id.toString(),
        name: app.name,
        price: app.price,
        available: app.count > 0,
        count: app.count
      }));
    } catch (error) {
      console.error('SmsMan getServices error:', error.message);
      throw new Error(`Failed to get services for country ${countryCode} from SmsMan`);
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
      
      // Get country ID first
      const countries = await this.getCountries();
      const country = countries.find(c => c.code.toLowerCase() === countryCode.toLowerCase());
      
      if (!country) {
        throw new Error(`Country not found: ${countryCode}`);
      }
      
      const response = await axios.get(`${this.baseUrl}/get-number`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json',
        },
        params: {
          country_id: country.id,
          application_id: service
        }
      });
      
      if (response.data.error) {
        throw new Error(`Error from SmsMan: ${response.data.error}`);
      }
      
      return {
        id: response.data.request_id.toString(),
        number: response.data.number,
        country: countryCode,
        service: service,
        status: 'pending',
        expiresAt: new Date(Date.now() + 20 * 60 * 1000).toISOString(), // 20 minutes expiration
        smsCode: null,
        providerData: response.data
      };
    } catch (error) {
      console.error('SmsMan purchaseNumber error:', error.message);
      throw new Error('Failed to purchase number from SmsMan');
    }
  }

  /**
   * Check number status
   * @param {string} id - Number ID
   * @returns {Promise<Object>}
   */
  async checkNumber(id) {
    try {
      const response = await axios.get(`${this.baseUrl}/get-sms`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json',
        },
        params: {
          request_id: id
        }
      });
      
      if (response.data.error) {
        // No SMS yet or other error
        return {
          id: id,
          status: 'pending',
          smsCode: null,
          providerData: response.data
        };
      }
      
      return {
        id: id,
        status: response.data.sms_code ? 'completed' : 'pending',
        smsCode: response.data.sms_code || null,
        providerData: response.data
      };
    } catch (error) {
      console.error('SmsMan checkNumber error:', error.message);
      throw new Error(`Failed to check number status for ID ${id} from SmsMan`);
    }
  }

  /**
   * Cancel a number
   * @param {string} id - Number ID
   * @returns {Promise<boolean>}
   */
  async cancelNumber(id) {
    try {
      const response = await axios.get(`${this.baseUrl}/deny`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json',
        },
        params: {
          request_id: id
        }
      });
      
      return !response.data.error;
    } catch (error) {
      console.error('SmsMan cancelNumber error:', error.message);
      throw new Error(`Failed to cancel number for ID ${id} from SmsMan`);
    }
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

module.exports = SmsManProvider;
