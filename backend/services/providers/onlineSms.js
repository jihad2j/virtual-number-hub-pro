
const axios = require('axios');
const { BaseProvider } = require('../providerFactory');

class OnlineSmsProvider extends BaseProvider {
  constructor(providerData) {
    super(providerData);
    this.baseUrl = this.apiUrl || 'https://onlinesim.ru/api';
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
      },
      params: {
        apikey: this.apiKey
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
      const response = await api.get('/getBalance.php');
      
      if (response.data && response.data.response === 1 && response.data.balance !== undefined) {
        return {
          balance: parseFloat(response.data.balance),
          currency: 'RUB'
        };
      }
      
      throw new Error('Failed to parse balance from response');
    } catch (error) {
      console.error('Error fetching balance from OnlineSms:', error.message);
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
      const response = await api.get('/getCountries.php');
      
      if (response.data && response.data.response === 1 && response.data.countries) {
        return Object.entries(response.data.countries).map(([id, name]) => ({
          id,
          name,
          code: this._getCountryCode(name),
          flag: this._getFlagEmoji(this._getCountryCode(name)),
          available: true
        }));
      }
      
      throw new Error('Failed to parse countries from response');
    } catch (error) {
      console.error('Error fetching countries from OnlineSms:', error.message);
      throw new Error(`Failed to fetch countries: ${error.message}`);
    }
  }

  /**
   * Helper method to map country names to ISO codes
   * @param {string} countryName - Country name
   * @returns {string} ISO country code
   */
  _getCountryCode(countryName) {
    const countryMapping = {
      'Russia': 'RU',
      'Ukraine': 'UA',
      'Kazakhstan': 'KZ',
      'China': 'CN',
      'Philippines': 'PH',
      'Myanmar': 'MM',
      'Indonesia': 'ID',
      'Malaysia': 'MY',
      'Kenya': 'KE',
      'Tanzania': 'TZ',
      'Vietnam': 'VN',
      'Kyrgyzstan': 'KG',
      'USA': 'US',
      'Poland': 'PL',
      'United Kingdom': 'GB',
      'Romania': 'RO',
      'Egypt': 'EG'
    };
    
    return countryMapping[countryName] || 'XX';
  }

  /**
   * Helper function to get flag emoji from country code
   * @param {string} countryCode - 2-letter country code
   * @returns {string} Flag emoji
   */
  _getFlagEmoji(countryCode) {
    if (!countryCode || countryCode === 'XX') return '🌍';
    
    try {
      const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
      return String.fromCodePoint(...codePoints);
    } catch (error) {
      return '🌍';
    }
  }
}

module.exports = OnlineSmsProvider;
