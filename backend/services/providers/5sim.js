
const axios = require('axios');
const { BaseProvider } = require('../providerFactory');

class FiveSimProvider extends BaseProvider {
  constructor(providerData) {
    super(providerData);
    this.baseUrl = this.apiUrl || 'https://5sim.net/v1';
  }

  /**
   * Create a configured axios instance for 5sim API
   * @returns {Object} Axios instance
   */
  _createAxiosInstance() {
    return axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  }

  /**
   * Get provider balance
   * @returns {Promise<{balance: number, currency: string}>}
   */
  async getBalance() {
    try {
      const api = this._createAxiosInstance();
      const response = await api.get('/user/profile');
      return {
        balance: response.data.balance,
        currency: 'RUB'
      };
    } catch (error) {
      console.error('Error fetching balance from 5sim:', error.message);
      throw new Error(`Failed to fetch balance: ${error.message}`);
    }
  }

  /**
   * Get available countries
   * @returns {Promise<Array>}
   */
  async getCountries() {
    try {
      const api = this._createAxiosInstance();
      const response = await api.get('/guest/countries');
      const countries = [];
      
      for (const [countryCode, countryData] of Object.entries(response.data)) {
        if (countryData.text_en && countryData.iso) {
          const isoCode = Object.keys(countryData.iso)[0];
          const prefix = Object.keys(countryData.prefix)[0] || '';
          
          countries.push({
            id: countries.length + 1,
            name: countryData.text_en,
            iso: isoCode,
            code: isoCode,
            prefix: prefix,
            available: true,
            flag: this._getFlagEmoji(isoCode.toUpperCase())
          });
        }
      }
      
      return countries;
    } catch (error) {
      console.error('Error fetching countries from 5sim:', error.message);
      throw new Error(`Failed to fetch countries: ${error.message}`);
    }
  }

  /**
   * Get available products for a country
   * @param {string} countryCode - Country code
   * @param {string} operator - Operator code (default: 'any')
   * @returns {Promise<Array>}
   */
  async getServices(countryCode, operator = 'any') {
    try {
      const api = this._createAxiosInstance();
      const response = await api.get(`/guest/products/${countryCode}/${operator}`);
      
      const services = [];
      for (const [serviceName, serviceData] of Object.entries(response.data)) {
        services.push({
          id: serviceName,
          name: serviceName,
          price: serviceData.price,
          count: serviceData.count
        });
      }
      
      return services;
    } catch (error) {
      console.error(`Error fetching services from 5sim for country ${countryCode}:`, error.message);
      throw new Error(`Failed to fetch services: ${error.message}`);
    }
  }

  /**
   * Purchase a number
   * @param {Object} options - Purchase options
   * @returns {Promise<Object>}
   */
  async purchaseNumber({ country, operator = 'any', product }) {
    try {
      const api = this._createAxiosInstance();
      const response = await api.get(`/user/buy/activation/${country}/${operator}/${product}`);
      
      return {
        id: response.data.id,
        phone: response.data.phone,
        operator: response.data.operator,
        product: response.data.product,
        price: response.data.price,
        status: response.data.status,
        country: response.data.country,
        createdAt: response.data.created_at,
        expiresAt: response.data.expires
      };
    } catch (error) {
      console.error(`Error purchasing number from 5sim:`, error.message);
      throw new Error(`Failed to purchase number: ${error.message}`);
    }
  }

  /**
   * Check number status
   * @param {string} id - Number ID
   * @returns {Promise<Object>}
   */
  async checkNumber(id) {
    try {
      const api = this._createAxiosInstance();
      const response = await api.get(`/user/check/${id}`);
      
      return {
        id: response.data.id,
        phone: response.data.phone,
        status: response.data.status,
        sms: response.data.sms.map(s => ({
          sender: s.sender,
          text: s.text,
          code: s.code,
          createdAt: s.created_at
        }))
      };
    } catch (error) {
      console.error(`Error checking number status from 5sim:`, error.message);
      throw new Error(`Failed to check number status: ${error.message}`);
    }
  }

  /**
   * Cancel a number
   * @param {string} id - Number ID
   * @returns {Promise<boolean>}
   */
  async cancelNumber(id) {
    try {
      const api = this._createAxiosInstance();
      await api.get(`/user/cancel/${id}`);
      return true;
    } catch (error) {
      console.error(`Error cancelling number from 5sim:`, error.message);
      throw new Error(`Failed to cancel number: ${error.message}`);
    }
  }

  /**
   * Helper function to get flag emoji from country code
   * @param {string} countryCode - 2-letter country code
   * @returns {string} Flag emoji
   */
  _getFlagEmoji(countryCode) {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  }
}

module.exports = FiveSimProvider;
