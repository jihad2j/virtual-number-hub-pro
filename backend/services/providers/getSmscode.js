
const axios = require('axios');
const { BaseProvider } = require('../providerFactory');

class GetSmsCodeProvider extends BaseProvider {
  constructor(providerData) {
    super(providerData);
    this.baseUrl = providerData.apiUrl || 'https://api.getsmscode.com';
  }

  /**
   * Get balance from GetSmsCode
   * @returns {Promise<{balance: number, currency: string}>}
   */
  async getBalance() {
    try {
      const response = await axios.get(`${this.baseUrl}/getbalance`, {
        params: {
          username: this.settings.username || '',
          token: this.apiKey
        }
      });
      
      // Parse balance from response
      const balance = parseFloat(response.data);
      
      return {
        balance: isNaN(balance) ? 0 : balance,
        currency: 'USD'
      };
    } catch (error) {
      console.error('GetSmsCode getBalance error:', error.message);
      throw new Error('Failed to get balance from GetSmsCode');
    }
  }

  /**
   * Get available countries from GetSmsCode
   * @returns {Promise<Array>}
   */
  async getCountries() {
    // GetSmsCode may not have a direct API for countries, returning static data
    return [
      { id: 'us', name: 'United States', code: 'US', iso: 'US', flag: this.getFlagEmoji('US') },
      { id: 'ca', name: 'Canada', code: 'CA', iso: 'CA', flag: this.getFlagEmoji('CA') },
      { id: 'uk', name: 'United Kingdom', code: 'GB', iso: 'GB', flag: this.getFlagEmoji('GB') },
      // Add more supported countries as needed
    ];
  }

  /**
   * Get available services for a country
   * @param {string} countryCode - Country code
   * @returns {Promise<Array>}
   */
  async getServices(countryCode) {
    // Return static list of services or implement API call if available
    return [
      { id: 'google', name: 'Google', available: true },
      { id: 'facebook', name: 'Facebook', available: true },
      { id: 'twitter', name: 'Twitter', available: true },
      { id: 'telegram', name: 'Telegram', available: true },
      // Add more services as needed
    ];
  }

  /**
   * Purchase a phone number
   * @param {Object} options - Purchase options
   * @returns {Promise<Object>}
   */
  async purchaseNumber(options) {
    try {
      const { countryCode, service } = options;
      
      const response = await axios.get(`${this.baseUrl}/getnumber`, {
        params: {
          username: this.settings.username || '',
          token: this.apiKey,
          pid: service,
          country: countryCode
        }
      });
      
      // Parse response
      const [status, id, number] = response.data.split('|');
      
      if (status !== 'success') {
        throw new Error(`Failed to get number: ${response.data}`);
      }
      
      return {
        id: id,
        number: number,
        country: countryCode,
        service: service,
        status: 'pending',
        expiresAt: new Date(Date.now() + 20 * 60 * 1000).toISOString(), // 20 minutes expiration
        smsCode: null,
        providerData: { id, number }
      };
    } catch (error) {
      console.error('GetSmsCode purchaseNumber error:', error.message);
      throw new Error('Failed to purchase number from GetSmsCode');
    }
  }

  /**
   * Check number status
   * @param {string} id - Number ID
   * @returns {Promise<Object>}
   */
  async checkNumber(id) {
    try {
      const response = await axios.get(`${this.baseUrl}/getcode`, {
        params: {
          username: this.settings.username || '',
          token: this.apiKey,
          pid: id
        }
      });
      
      // Parse response
      const code = response.data.trim();
      
      return {
        id: id,
        status: code.startsWith('code:') ? 'completed' : 'pending',
        smsCode: code.startsWith('code:') ? code.substring(5) : null,
        providerData: { code }
      };
    } catch (error) {
      console.error('GetSmsCode checkNumber error:', error.message);
      throw new Error(`Failed to check number status for ID ${id} from GetSmsCode`);
    }
  }

  /**
   * Cancel a number
   * @param {string} id - Number ID
   * @returns {Promise<boolean>}
   */
  async cancelNumber(id) {
    try {
      const response = await axios.get(`${this.baseUrl}/releasephone`, {
        params: {
          username: this.settings.username || '',
          token: this.apiKey,
          pid: id
        }
      });
      
      return response.data.includes('success');
    } catch (error) {
      console.error('GetSmsCode cancelNumber error:', error.message);
      throw new Error(`Failed to cancel number for ID ${id} from GetSmsCode`);
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

module.exports = GetSmsCodeProvider;
