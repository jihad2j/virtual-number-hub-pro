
const axios = require('axios');
const { BaseProvider } = require('../providerFactory');

class OnlineSmsProvider extends BaseProvider {
  constructor(providerData) {
    super(providerData);
    this.baseUrl = providerData.apiUrl || 'https://onlinesim.ru/api';
  }

  /**
   * Get balance from OnlineSms
   * @returns {Promise<{balance: number, currency: string}>}
   */
  async getBalance() {
    try {
      const response = await axios.get(`${this.baseUrl}/getBalance.php`, {
        params: {
          apikey: this.apiKey,
          lang: 'en'
        }
      });
      
      if (response.data.response !== 1) {
        throw new Error(`Error from OnlineSms: ${response.data.response_text}`);
      }
      
      return {
        balance: response.data.balance || 0,
        currency: 'RUB'
      };
    } catch (error) {
      console.error('OnlineSms getBalance error:', error.message);
      throw new Error('Failed to get balance from OnlineSms');
    }
  }

  /**
   * Get available countries from OnlineSms
   * @returns {Promise<Array>}
   */
  async getCountries() {
    try {
      const response = await axios.get(`${this.baseUrl}/getCountries.php`, {
        params: {
          apikey: this.apiKey,
          lang: 'en'
        }
      });
      
      if (response.data.response !== 1) {
        throw new Error(`Error from OnlineSms: ${response.data.response_text}`);
      }
      
      // Format countries to match our schema
      const countriesList = [];
      for (const countryId in response.data.countries) {
        const country = response.data.countries[countryId];
        countriesList.push({
          id: countryId,
          name: country.name,
          code: country.iso,
          iso: country.iso,
          flag: this.getFlagEmoji(country.iso)
        });
      }
      
      return countriesList;
    } catch (error) {
      console.error('OnlineSms getCountries error:', error.message);
      throw new Error('Failed to get countries from OnlineSms');
    }
  }

  /**
   * Get available services for a country
   * @param {string} countryCode - Country code
   * @returns {Promise<Array>}
   */
  async getServices(countryCode) {
    try {
      // Get country ID from code
      const countries = await this.getCountries();
      const country = countries.find(c => c.code.toLowerCase() === countryCode.toLowerCase());
      
      if (!country) {
        throw new Error(`Country not found: ${countryCode}`);
      }
      
      const response = await axios.get(`${this.baseUrl}/getServices.php`, {
        params: {
          apikey: this.apiKey,
          country: country.id,
          lang: 'en'
        }
      });
      
      if (response.data.response !== 1) {
        throw new Error(`Error from OnlineSms: ${response.data.response_text}`);
      }
      
      // Format services to match our schema
      const servicesList = [];
      for (const serviceId in response.data.services) {
        const service = response.data.services[serviceId];
        servicesList.push({
          id: serviceId,
          name: service.name,
          price: service.price,
          count: service.count,
          available: service.count > 0
        });
      }
      
      return servicesList;
    } catch (error) {
      console.error('OnlineSms getServices error:', error.message);
      throw new Error(`Failed to get services for country ${countryCode} from OnlineSms`);
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
      
      // Get country ID from code
      const countries = await this.getCountries();
      const country = countries.find(c => c.code.toLowerCase() === countryCode.toLowerCase());
      
      if (!country) {
        throw new Error(`Country not found: ${countryCode}`);
      }
      
      const response = await axios.get(`${this.baseUrl}/getNum.php`, {
        params: {
          apikey: this.apiKey,
          service: service,
          country: country.id,
          lang: 'en'
        }
      });
      
      if (response.data.response !== 1) {
        throw new Error(`Error from OnlineSms: ${response.data.response_text}`);
      }
      
      return {
        id: response.data.tzid.toString(),
        number: response.data.number,
        country: countryCode,
        service: service,
        status: 'pending',
        expiresAt: new Date(Date.now() + 20 * 60 * 1000).toISOString(), // 20 minutes expiration
        smsCode: null,
        providerData: response.data
      };
    } catch (error) {
      console.error('OnlineSms purchaseNumber error:', error.message);
      throw new Error('Failed to purchase number from OnlineSms');
    }
  }

  /**
   * Check number status
   * @param {string} id - Number ID
   * @returns {Promise<Object>}
   */
  async checkNumber(id) {
    try {
      const response = await axios.get(`${this.baseUrl}/getState.php`, {
        params: {
          apikey: this.apiKey,
          tzid: id,
          lang: 'en',
          message_to_code: 1
        }
      });
      
      let status = 'pending';
      let smsCode = null;
      
      // Process response
      if (Array.isArray(response.data) && response.data.length > 0) {
        const statusData = response.data[0];
        
        if (statusData.response === 'TZ_NUM_ANSWER') {
          status = 'completed';
          smsCode = statusData.msg;
        } else if (['TZ_OVER_EMPTY', 'TZ_OVER_OK', 'TZ_DELETED'].includes(statusData.response)) {
          status = 'cancelled';
        }
      }
      
      return {
        id: id,
        status: status,
        smsCode: smsCode,
        providerData: response.data
      };
    } catch (error) {
      console.error('OnlineSms checkNumber error:', error.message);
      throw new Error(`Failed to check number status for ID ${id} from OnlineSms`);
    }
  }

  /**
   * Cancel a number
   * @param {string} id - Number ID
   * @returns {Promise<boolean>}
   */
  async cancelNumber(id) {
    try {
      const response = await axios.get(`${this.baseUrl}/setOperationRevise.php`, {
        params: {
          apikey: this.apiKey,
          tzid: id,
          revision: 'reject',
          lang: 'en'
        }
      });
      
      return response.data.response === 1;
    } catch (error) {
      console.error('OnlineSms cancelNumber error:', error.message);
      throw new Error(`Failed to cancel number for ID ${id} from OnlineSms`);
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

module.exports = OnlineSmsProvider;
