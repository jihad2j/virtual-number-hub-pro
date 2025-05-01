
const axios = require('axios');
const { BaseProvider } = require('../providerFactory');
const querystring = require('querystring');

class SmsActivateProvider extends BaseProvider {
  constructor(providerData) {
    super(providerData);
    this.baseUrl = this.apiUrl || 'https://api.sms-activate.org/stubs/handler_api.php';
  }

  /**
   * Make a request to SMS Activate API
   * @param {Object} params - Request parameters
   * @returns {Promise<any>}
   */
  async _makeRequest(params) {
    try {
      params.api_key = this.apiKey;
      
      const response = await axios({
        method: 'POST',
        url: this.baseUrl,
        data: querystring.stringify(params),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      const text = response.data;
      
      if (typeof text === 'string') {
        // Handle different response formats
        if (text.startsWith('ACCESS_NUMBER:')) {
          const [, id, number] = text.split(':');
          return { success: true, id, number };
        } else if (text.startsWith('ACCESS_BALANCE:')) {
          const balance = parseFloat(text.split(':')[1]);
          return { success: true, balance };
        } else if (text.startsWith('STATUS_OK')) {
          return { success: true };
        } else if (text === 'NO_NUMBERS') {
          throw new Error('No numbers available');
        } else if (text === 'NO_BALANCE') {
          throw new Error('Insufficient balance');
        } else {
          try {
            // Try to parse as JSON if it's a structured response
            return JSON.parse(text);
          } catch (e) {
            return { success: false, message: text };
          }
        }
      } else {
        return response.data;
      }
    } catch (error) {
      console.error('SMS Activate API request failed:', error.message);
      throw new Error(`SMS Activate API error: ${error.message}`);
    }
  }

  /**
   * Get provider balance
   * @returns {Promise<{balance: number, currency: string}>}
   */
  async getBalance() {
    try {
      const response = await this._makeRequest({
        action: 'getBalance'
      });
      
      if (response.success && typeof response.balance === 'number') {
        return { balance: response.balance, currency: 'RUB' };
      }
      throw new Error('Failed to get balance');
    } catch (error) {
      console.error('Error getting SMS Activate balance:', error.message);
      throw error;
    }
  }

  /**
   * Get available countries
   * @returns {Promise<Array>}
   */
  async getCountries() {
    try {
      const response = await this._makeRequest({
        action: 'getCountries'
      });
      
      const countries = [];
      
      for (const [id, countryData] of Object.entries(response)) {
        countries.push({
          id: id,
          name: countryData.rus || countryData.eng || `Country ${id}`,
          code: countryData.iso || '',
          available: true,
          flag: this._getFlagEmoji(countryData.iso?.toUpperCase() || 'XX')
        });
      }
      
      return countries;
    } catch (error) {
      console.error('Error getting SMS Activate countries:', error.message);
      throw error;
    }
  }

  /**
   * Get services/products
   * @param {string} countryId - Country ID
   * @returns {Promise<Array>}
   */
  async getServices(countryId = '0') {
    try {
      const response = await this._makeRequest({
        action: 'getServices',
        country: countryId
      });
      
      const services = [];
      
      for (const [serviceId, serviceData] of Object.entries(response)) {
        services.push({
          id: serviceId,
          name: serviceId,
          price: parseFloat(serviceData.cost) || 0,
          count: parseInt(serviceData.count) || 0
        });
      }
      
      return services;
    } catch (error) {
      console.error('Error getting SMS Activate services:', error.message);
      throw error;
    }
  }

  /**
   * Purchase a number
   * @param {Object} options - Purchase options
   * @returns {Promise<Object>}
   */
  async purchaseNumber({ serviceId, countryId = '0' }) {
    try {
      const response = await this._makeRequest({
        action: 'getNumber',
        service: serviceId,
        country: countryId
      });
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to purchase number');
      }
      
      return {
        id: response.id,
        phone: response.number,
        country: countryId,
        operator: 'unknown',
        price: 0, // Price is not returned in the response
        status: 'PENDING'
      };
    } catch (error) {
      console.error('Error purchasing SMS Activate number:', error.message);
      throw error;
    }
  }

  /**
   * Check number status
   * @param {string} id - Number ID
   * @returns {Promise<Object>}
   */
  async checkNumber(id) {
    try {
      const response = await this._makeRequest({
        action: 'getStatus',
        id
      });
      
      let status = 'PENDING';
      let sms = [];
      
      if (response.startsWith('STATUS_OK:')) {
        status = 'RECEIVED';
        const smsText = response.split(':')[1];
        sms = [{
          text: smsText,
          code: this._extractCode(smsText),
          sender: 'unknown',
          createdAt: new Date().toISOString()
        }];
      }
      
      return {
        id,
        status,
        sms
      };
    } catch (error) {
      console.error('Error getting SMS Activate number status:', error.message);
      throw error;
    }
  }

  /**
   * Cancel a number
   * @param {string} id - Number ID
   * @returns {Promise<boolean>}
   */
  async cancelNumber(id) {
    try {
      const response = await this._makeRequest({
        action: 'setStatus',
        id,
        status: '8' // Status 8 means cancel
      });
      
      return response.success === true;
    } catch (error) {
      console.error('Error cancelling SMS Activate number:', error.message);
      throw error;
    }
  }
  
  /**
   * Helper method to extract code from SMS
   * @param {string} text - SMS text
   * @returns {string} Verification code
   */
  _extractCode(text) {
    // Try to find a sequence of 4-6 digits that could be a code
    const match = text.match(/\b\d{4,6}\b/);
    return match ? match[0] : '';
  }

  /**
   * Helper function to get flag emoji from country code
   * @param {string} countryCode - 2-letter country code
   * @returns {string} Flag emoji
   */
  _getFlagEmoji(countryCode) {
    if (!countryCode || countryCode === 'XX') {
      return '🌍'; // Default globe emoji
    }
    
    try {
      const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
      return String.fromCodePoint(...codePoints);
    } catch (error) {
      return '🌍'; // Default globe emoji on error
    }
  }
}

module.exports = SmsActivateProvider;
