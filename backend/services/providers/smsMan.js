
const axios = require('axios');
const { BaseProvider } = require('../providerFactory');

class SmsManProvider extends BaseProvider {
  constructor(providerData) {
    super(providerData);
    this.baseUrl = this.apiUrl || 'https://api.sms-man.com/control';
  }

  /**
   * Create a configured axios instance
   * @returns {Object} Axios instance
   */
  _createAxiosInstance() {
    return axios.create({
      baseURL: this.baseUrl,
      headers: {
        'X-API-KEY': this.apiKey,
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
      const response = await api.get('/get-balance');
      
      if (response.data && response.data.balance !== undefined) {
        return {
          balance: response.data.balance,
          currency: 'RUB'
        };
      }
      
      throw new Error('Failed to parse balance from response');
    } catch (error) {
      console.error('Error fetching balance from SmsMan:', error.message);
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
      const response = await api.get('/countries');
      
      if (response.data && Array.isArray(response.data)) {
        return response.data.map(country => ({
          id: country.id.toString(),
          name: country.name,
          code: country.iso,
          flag: this._getFlagEmoji(country.iso),
          available: true
        }));
      }
      
      throw new Error('Failed to parse countries from response');
    } catch (error) {
      console.error('Error fetching countries from SmsMan:', error.message);
      throw new Error(`Failed to fetch countries: ${error.message}`);
    }
  }

  /**
   * Helper function to get flag emoji from country code
   * @param {string} countryCode - 2-letter country code
   * @returns {string} Flag emoji
   */
  _getFlagEmoji(countryCode) {
    if (!countryCode) return '🌍';
    
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  }
}

module.exports = SmsManProvider;
