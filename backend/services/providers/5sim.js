
const axios = require('axios');
const { BaseProvider } = require('../providerFactory');

class FiveSimProvider extends BaseProvider {
  constructor(providerData) {
    super(providerData);
    this.baseUrl = 'https://5sim.net/v1/';
  }

  /**
   * Get balance from 5SIM
   * @returns {Promise<{balance: number, currency: string}>}
   */
  async getBalance() {
    try {
      const response = await axios.get(`${this.baseUrl}user/profile`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json',
        }
      });
      
      return {
        balance: response.data.balance,
        currency: 'RUB' // 5sim uses Russian Rubles
      };
    } catch (error) {
      console.error('5SIM getBalance error:', error.message);
      throw new Error('Failed to get balance from 5SIM');
    }
  }

  /**
   * Get available countries from 5SIM
   * @returns {Promise<Array>}
   */
  async getCountries() {
    try {
      const response = await axios.get(`${this.baseUrl}guest/countries`, {
        headers: {
          'Accept': 'application/json',
        }
      });
      
      // Format countries to match our schema
      return Object.entries(response.data).map(([code, data]) => ({
        name: data.country_text,
        code: code.toUpperCase(),
        iso: code.toUpperCase(),
        flag: this.getFlagEmoji(code.toUpperCase())
      }));
    } catch (error) {
      console.error('5SIM getCountries error:', error.message);
      throw new Error('Failed to get countries from 5SIM');
    }
  }

  /**
   * Get available services for a country
   * @param {string} countryCode - Country code
   * @returns {Promise<Array>}
   */
  async getServices(countryCode) {
    try {
      // 5sim API expects lowercase country codes
      const normalizedCountryCode = countryCode.toLowerCase();

      // First check if the country exists in the API
      const countryResponse = await axios.get(`${this.baseUrl}guest/countries`, {
        headers: {
          'Accept': 'application/json',
        }
      });
      
      // Check if the country is supported by 5sim
      if (!countryResponse.data[normalizedCountryCode]) {
        throw new Error(`Country ${countryCode} is not supported by 5SIM`);
      }
      
      const response = await axios.get(`${this.baseUrl}guest/products/${normalizedCountryCode}`, {
        headers: {
          'Accept': 'application/json',
        }
      });
      
      // Format services to match our schema
      return Object.keys(response.data).map(service => ({
        id: service,
        name: service,
        price: response.data[service].cost,
        available: true
      }));
    } catch (error) {
      // Check if this is a 404 error (country not found)
      if (error.response && error.response.status === 404) {
        console.error(`5SIM: Country ${countryCode} not found in the API`);
        // Return empty array instead of throwing error
        return [];
      }
      
      console.error(`5SIM getServices error: ${error.message}`);
      throw new Error(`Failed to get services for country ${countryCode} from 5SIM`);
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
      
      const response = await axios.get(`${this.baseUrl}user/buy/activation/${countryCode.toLowerCase()}/${service.toLowerCase()}/any`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json',
        }
      });
      
      return {
        id: response.data.id.toString(),
        number: response.data.phone,
        country: countryCode,
        service: service,
        status: 'pending',
        expiresAt: new Date(Date.now() + 20 * 60 * 1000).toISOString(), // 20 minutes expiration
        smsCode: null,
        providerData: response.data
      };
    } catch (error) {
      console.error('5SIM purchaseNumber error:', error.message);
      throw new Error('Failed to purchase number from 5SIM');
    }
  }

  /**
   * Check number status
   * @param {string} id - Number ID
   * @returns {Promise<Object>}
   */
  async checkNumber(id) {
    try {
      const response = await axios.get(`${this.baseUrl}user/check/${id}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json',
        }
      });
      
      // Extract SMS code if available
      const smsCode = response.data.sms.length > 0 ? response.data.sms[0].code : null;
      
      return {
        id: response.data.id.toString(),
        number: response.data.phone,
        status: response.data.status,
        smsCode,
        providerData: response.data
      };
    } catch (error) {
      console.error('5SIM checkNumber error:', error.message);
      throw new Error(`Failed to check number status for ID ${id} from 5SIM`);
    }
  }

  /**
   * Cancel a number
   * @param {string} id - Number ID
   * @returns {Promise<boolean>}
   */
  async cancelNumber(id) {
    try {
      await axios.get(`${this.baseUrl}user/cancel/${id}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json',
        }
      });
      
      return true;
    } catch (error) {
      console.error('5SIM cancelNumber error:', error.message);
      throw new Error(`Failed to cancel number for ID ${id} from 5SIM`);
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

module.exports = FiveSimProvider;
