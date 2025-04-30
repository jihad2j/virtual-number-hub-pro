
const axios = require('axios');
const { BaseProvider } = require('../providerFactory');

class GetSmsCodeProvider extends BaseProvider {
  constructor(providerData) {
    super(providerData);
    this.baseUrl = this.apiUrl || 'https://api.getsmscode.com';
  }

  /**
   * Create a configured axios instance
   * @returns {Object} Axios instance
   */
  _createAxiosInstance() {
    return axios.create({
      baseURL: this.baseUrl,
      headers: {
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
      const response = await api.post('/api/getbalance', {
        username: this.settings.username,
        token: this.apiKey
      });
      
      if (response.data && response.data.Balance) {
        return {
          balance: parseFloat(response.data.Balance),
          currency: 'USD'
        };
      }
      
      throw new Error('Failed to parse balance from response');
    } catch (error) {
      console.error('Error fetching balance from GetSmsCode:', error.message);
      throw new Error(`Failed to fetch balance: ${error.message}`);
    }
  }

  /**
   * Get available countries
   * @returns {Promise<Array>}
   */
  async getCountries() {
    // Sample implementation - should be replaced with actual API call
    return [
      {
        id: 'CN',
        name: 'China',
        code: 'CN',
        flag: this._getFlagEmoji('CN'),
        available: true
      },
      {
        id: 'US',
        name: 'United States',
        code: 'US',
        flag: this._getFlagEmoji('US'),
        available: true
      }
    ];
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

module.exports = GetSmsCodeProvider;
