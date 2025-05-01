
/**
 * Provider Factory - Create provider instances based on their code
 */

// Base provider class with default implementations
class BaseProvider {
  constructor(providerData) {
    this.id = providerData._id || providerData.id;
    this.name = providerData.name;
    this.apiKey = providerData.apiKey;
    this.apiUrl = providerData.apiUrl;
    this.endpoints = providerData.endpoints || {};
    this.settings = providerData.settings || {};
  }

  /**
   * Get provider balance
   * @returns {Promise<{balance: number, currency: string}>}
   */
  async getBalance() {
    throw new Error(`getBalance not implemented for provider ${this.name}`);
  }

  /**
   * Get available countries
   * @returns {Promise<Array>}
   */
  async getCountries() {
    throw new Error(`getCountries not implemented for provider ${this.name}`);
  }

  /**
   * Get available services for a country
   * @param {string} countryCode - Country code
   * @returns {Promise<Array>}
   */
  async getServices(countryCode) {
    throw new Error(`getServices not implemented for provider ${this.name}`);
  }

  /**
   * Purchase a phone number
   * @param {Object} options - Purchase options
   * @returns {Promise<Object>}
   */
  async purchaseNumber(options) {
    throw new Error(`purchaseNumber not implemented for provider ${this.name}`);
  }

  /**
   * Check number status
   * @param {string} id - Number ID
   * @returns {Promise<Object>}
   */
  async checkNumber(id) {
    throw new Error(`checkNumber not implemented for provider ${this.name}`);
  }

  /**
   * Cancel a number
   * @param {string} id - Number ID
   * @returns {Promise<boolean>}
   */
  async cancelNumber(id) {
    throw new Error(`cancelNumber not implemented for provider ${this.name}`);
  }

  /**
   * Test connection to the provider
   * @returns {Promise<boolean>}
   */
  async testConnection() {
    try {
      await this.getBalance();
      return true;
    } catch (error) {
      console.error(`Connection test failed for ${this.name}:`, error);
      return false;
    }
  }
}

/**
 * Factory to create provider instances based on provider code
 */
class ProviderFactory {
  /**
   * Create a provider instance based on provider data
   * @param {Object} providerData - Provider data from the database
   * @returns {Object} Provider instance
   */
  static createProvider(providerData) {
    if (!providerData) return null;

    const { code } = providerData;
    
    // Import dynamically to avoid circular dependencies
    switch(code.toLowerCase()) {
      case '5sim':
        return new (require('./providers/5sim'))(providerData);
      case 'smsactivate':
        return new (require('./providers/smsActivate'))(providerData);
      case 'getsmscode':
        return new (require('./providers/getSmscode'))(providerData);
      case 'smsman':
        return new (require('./providers/smsMan'))(providerData);
      case 'onlinesms':
        return new (require('./providers/onlineSms'))(providerData);
      default:
        // Default generic provider
        return new BaseProvider(providerData);
    }
  }
}

// Export both the factory and the base provider class
module.exports = { ProviderFactory, BaseProvider };
