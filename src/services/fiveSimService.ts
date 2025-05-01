
// ================================
// DEPRECATED: This file is deprecated and will be removed in a future release.
// All provider interactions should now be through the providerService.ts
// which communicates with the backend API.
// ================================

console.warn('fiveSimService.ts is deprecated and will be removed in a future release. Please use providerService.ts instead.');

// API token for 5sim
const API_TOKEN = "eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NzUwNzkzNjEsImlhdCI6MTc0MzU0MzM2MSwicmF5IjoiYzViYjRjNWNiZjA0N2U2OTI1OWI0YWUzOTM0MmQ1YjQiLCJzdWIiOjEyODQ5OTF9.b1IL-DlhrrOMhcAnq6pxoucrlboVoSbDbjZAI1kcIV63lAr9Kk0WvmE5KQf8a0WH1nkbGZR71i8sCRxCloIVGp08RFVFGsYpSos7flQtzoZs6_TPbuhwJoJKYgPKjNMZVT1Vi9_ywMGRBuOvsbBn6qcAGOCRLKByGuW8PwS7pxmmJbvsB3HD40ek5vFTHpFTxEwVz4OpAOjbmq-Aj6Vz-bz8ymndpIm6D2yGBhRV9aQ4yRrrG-zHZfA-1ayd6vQz969aQIK6sM2tsXRrPKO-hpbF4f7vtsg-RX41DqcZy3t2BWnlB2JwvTB_lLlrm_al0J4k-pqr6lR9TnjsJ3WXBg";
const API_BASE_URL = "https://5sim.net/v1";
//const PROXY_URL = "https://corsproxy.io/"; // Adding a CORS proxy to handle the CORS issues
const PROXY_URL = "";
// Default headers for all requests
const defaultHeaders = {
  "Authorization": `Bearer ${API_TOKEN}`,
  "Content-Type": "application/json",
};

// Types used for 5Sim API
export interface FiveSimCountry {
  id: number;
  name: string;
  iso: string;
  prefix: string;
}

export interface FiveSimProduct {
  category: string;
  price: number;
  count: number;
}

export interface FiveSimPhoneNumber {
  id: number;
  phone: string;
  operator: string;
  product: string;
  price: number;
  status: string;
  expires: string;
  sms: FiveSimSMS[];
  created_at: string;
  country: string;
  forwarding?: boolean;
  forwarding_number?: string;
}

export interface FiveSimSMS {
  id?: number;
  created_at: string;
  date: string;
  sender: string;
  text: string;
  code: string;
  is_wave?: boolean;
  wave_uuid?: string;
}

export interface FiveSimUserProfile {
  id: number;
  email: string;
  vendor: string;
  default_forwarding_number: string;
  balance: number;
  rating: number;
  default_country: {
    name: string;
    iso: string;
    prefix: string;
  };
  default_operator: {
    name: string;
  };
  frozen_balance: number;
}

export interface FiveSimOrdersResponse {
  Data: FiveSimPhoneNumber[];
  ProductNames: string[];
  Statuses: string[];
  Total: number;
}

export interface FiveSimPaymentsResponse {
  Data: {
    ID: number;
    TypeName: string;
    ProviderName: string;
    Amount: number;
    Balance: number;
    CreatedAt: string;
  }[];
  PaymentTypes: { Name: string }[];
  PaymentProviders: { Name: string }[];
  Total: number;
}

// Helper function to make API requests with proper error handling
const makeRequest = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const url = PROXY_URL ? `${PROXY_URL}${API_BASE_URL}${endpoint}` : `${API_BASE_URL}${endpoint}`;
  
  try {
    console.log(`Making request to: ${url}`);
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...(options.headers || {})
      },
      mode: 'cors'
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error (${response.status}): ${errorText}`);
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Request failed for ${endpoint}:`, error);
    throw error;
  }
};

// 5sim service implementation
export const fiveSimApi = {
  // Get list of available countries
  getCountries: async (): Promise<FiveSimCountry[]> => {
    try {
      const data = await makeRequest("/guest/countries");
      const countries: FiveSimCountry[] = [];
      
      // Convert the nested object format to an array of FiveSimCountry objects
      for (const [countryCode, countryData] of Object.entries(data)) {
        const countryInfo = countryData as any;
        if (countryInfo.text_en && countryInfo.iso) {
          const isoCode = Object.keys(countryInfo.iso)[0];
          const prefix = Object.keys(countryInfo.prefix)[0] || '';
          
          countries.push({
            id: countries.length + 1,
            name: countryInfo.text_en,
            iso: isoCode,
            prefix: prefix
          });
        }
      }
      
      return countries;
    } catch (error) {
      console.error("Error fetching countries list from 5sim:", error);
      throw error;
    }
  },

  // Get available products for a country
  getProducts: async (country: string, operator: string = "any"): Promise<Record<string, FiveSimProduct>> => {
    try {
      return await makeRequest(`/guest/products/${country}/${operator}`);
    } catch (error) {
      console.error(`Error fetching products from 5sim for country ${country}:`, error);
      throw error;
    }
  },

  // Get pricing information
  getPrices: async (country?: string, product?: string): Promise<any> => {
    try {
      let endpoint = "/guest/prices";
      if (country && product) {
        endpoint += `?country=${country}&product=${product}`;
      } else if (country) {
        endpoint += `?country=${country}`;
      } else if (product) {
        endpoint += `?product=${product}`;
      }
      
      return await makeRequest(endpoint);
    } catch (error) {
      console.error("Error fetching prices from 5sim:", error);
      throw error;
    }
  },

  // Purchase a number
  purchaseNumber: async (country: string, operator: string, product: string): Promise<FiveSimPhoneNumber> => {
    try {
      return await makeRequest(`/user/buy/activation/${country}/${operator}/${product}`);
    } catch (error) {
      console.error(`Error purchasing number from 5sim:`, error);
      throw error;
    }
  },

  // Check number status
  checkNumber: async (id: number): Promise<FiveSimPhoneNumber> => {
    try {
      return await makeRequest(`/user/check/${id}`);
    } catch (error) {
      console.error(`Error checking number status from 5sim:`, error);
      throw error;
    }
  },

  // Set number status to "finished"
  finishNumber: async (id: number): Promise<FiveSimPhoneNumber> => {
    try {
      return await makeRequest(`/user/finish/${id}`);
    } catch (error) {
      console.error(`Error finishing number from 5sim:`, error);
      throw error;
    }
  },

  // Cancel number
  cancelNumber: async (id: number): Promise<FiveSimPhoneNumber> => {
    try {
      return await makeRequest(`/user/cancel/${id}`);
    } catch (error) {
      console.error(`Error cancelling number from 5sim:`, error);
      throw error;
    }
  },

  // Ban number
  banNumber: async (id: number): Promise<FiveSimPhoneNumber> => {
    try {
      return await makeRequest(`/user/ban/${id}`);
    } catch (error) {
      console.error(`Error banning number from 5sim:`, error);
      throw error;
    }
  },

  // Get account balance and profile
  getProfile: async (): Promise<FiveSimUserProfile> => {
    try {
      return await makeRequest(`/user/profile`);
    } catch (error) {
      console.error(`Error fetching profile from 5sim:`, error);
      throw error;
    }
  },
  
  // Get balance (simplified from getProfile for backward compatibility)
  getBalance: async (): Promise<{ balance: number; currency: string }> => {
    try {
      const profile = await fiveSimApi.getProfile();
      return { balance: profile.balance, currency: "RUB" };
    } catch (error) {
      console.error(`Error fetching balance from 5sim:`, error);
      throw error;
    }
  },

  // Get orders history
  getOrders: async (category: 'hosting' | 'activation', limit?: number, offset?: number, reverse?: boolean): Promise<FiveSimOrdersResponse> => {
    try {
      let endpoint = `/user/orders?category=${category}`;
      if (limit) endpoint += `&limit=${limit}`;
      if (offset) endpoint += `&offset=${offset}`;
      if (reverse !== undefined) endpoint += `&reverse=${reverse}`;
      
      return await makeRequest(endpoint);
    } catch (error) {
      console.error("Error fetching orders from 5sim:", error);
      throw error;
    }
  },

  // Get payments history
  getPayments: async (limit?: number, offset?: number, reverse?: boolean): Promise<FiveSimPaymentsResponse> => {
    try {
      let endpoint = `/user/payments`;
      if (limit) endpoint += `?limit=${limit}`;
      if (offset) endpoint += `&offset=${offset}`;
      if (reverse !== undefined) endpoint += `&reverse=${reverse}`;
      
      return await makeRequest(endpoint);
    } catch (error) {
      console.error("Error fetching payments from 5sim:", error);
      throw error;
    }
  },
  
  // Get SMS inbox list
  getSmsInbox: async (id: number): Promise<{ Data: FiveSimSMS[], Total: number }> => {
    try {
      return await makeRequest(`/user/sms/inbox/${id}`);
    } catch (error) {
      console.error(`Error fetching SMS inbox from 5sim for order ${id}:`, error);
      throw error;
    }
  }
};

// SMS Activate API implementation
export interface SMSActivateCountry {
  id: string;
  name: string;
  code: string;
}

export interface SMSActivateService {
  id: string;
  name: string;
  price: number;
  count: number;
}

export interface SMSActivateNumber {
  id: string;
  number: string;
  country: string;
  operator: string;
  price: number;
  status: string;
  sms?: Array<{
    text: string;
    code: string;
    sender: string;
    date: string;
  }>;
}

export const smsActivateApi = {
  // API key for SMS Activate
  apiKey: "",
  proxyUrl: "https://corsproxy.io/?",
  baseUrl: "https://api.sms-activate.org/stubs/handler_api.php",
  
  setApiKey(key: string) {
    this.apiKey = key;
  },
  
  // Make request to SMS Activate API
  async makeRequest(params: Record<string, string>): Promise<any> {
    const url = new URL(this.proxyUrl + this.baseUrl);
    
    // Add API key to all requests
    params.api_key = this.apiKey;
    
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      searchParams.append(key, value);
    }
    
    const options: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': window.location.origin,
        'Referer': window.location.origin
      },
      body: searchParams,
      mode: 'cors'
    };
    
    try {
      console.log(`Making request to SMS Activate: ${url}`);
      const response = await fetch(url.toString(), options);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      const text = await response.text();
      
      // SMS Activate returns different formats based on the action
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
        return { success: false, error: 'No numbers available' };
      } else if (text === 'NO_BALANCE') {
        return { success: false, error: 'Insufficient balance' };
      } else {
        try {
          // Try to parse as JSON if it's a structured response
          return JSON.parse(text);
        } catch (e) {
          return { success: false, message: text };
        }
      }
    } catch (error) {
      console.error('SMS Activate API request failed:', error);
      throw error;
    }
  },
  
  // Get balance
  async getBalance(): Promise<number> {
    try {
      const response = await this.makeRequest({
        action: 'getBalance'
      });
      
      if (response.success && typeof response.balance === 'number') {
        return response.balance;
      }
      throw new Error('Failed to get balance');
    } catch (error) {
      console.error('Error getting SMS Activate balance:', error);
      throw error;
    }
  },
  
  // Get countries list
  async getCountries(): Promise<SMSActivateCountry[]> {
    try {
      const response = await this.makeRequest({
        action: 'getCountries'
      });
      
      const countries: SMSActivateCountry[] = [];
      
      for (const [id, countryData] of Object.entries(response)) {
        const data = countryData as any;
        countries.push({
          id: id,
          name: data.rus || data.eng || `Country ${id}`,
          code: data.iso || ''
        });
      }
      
      return countries;
    } catch (error) {
      console.error('Error getting SMS Activate countries:', error);
      throw error;
    }
  },
  
  // Get services/products
  async getServices(countryId: string = '0'): Promise<Record<string, SMSActivateService>> {
    try {
      const response = await this.makeRequest({
        action: 'getServices',
        country: countryId
      });
      
      const services: Record<string, SMSActivateService> = {};
      
      for (const [serviceId, serviceData] of Object.entries(response)) {
        const data = serviceData as any;
        services[serviceId] = {
          id: serviceId,
          name: serviceId,
          price: parseFloat(data.cost) || 0,
          count: parseInt(data.count) || 0
        };
      }
      
      return services;
    } catch (error) {
      console.error('Error getting SMS Activate services:', error);
      throw error;
    }
  },
  
  // Purchase a number
  async purchaseNumber(serviceId: string, countryId: string = '0'): Promise<SMSActivateNumber> {
    try {
      const response = await this.makeRequest({
        action: 'getNumber',
        service: serviceId,
        country: countryId
      });
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to purchase number');
      }
      
      return {
        id: response.id,
        number: response.number,
        country: countryId,
        operator: 'unknown',
        price: 0, // Price is not returned in the response
        status: 'PENDING'
      };
    } catch (error) {
      console.error('Error purchasing SMS Activate number:', error);
      throw error;
    }
  },
  
  // Get number status
  async getNumberStatus(id: string): Promise<SMSActivateNumber> {
    try {
      const response = await this.makeRequest({
        action: 'getStatus',
        id
      });
      
      let status = 'PENDING';
      let sms = undefined;
      
      if (response.startsWith('STATUS_OK:')) {
        status = 'RECEIVED';
        const smsText = response.split(':')[1];
        sms = [{
          text: smsText,
          code: this.extractCode(smsText),
          sender: 'unknown',
          date: new Date().toISOString()
        }];
      }
      
      return {
        id,
        number: '',  // We don't have the number here
        country: '',  // We don't have the country here
        operator: '',
        price: 0,
        status,
        sms
      };
    } catch (error) {
      console.error('Error getting SMS Activate number status:', error);
      throw error;
    }
  },
  
  // Set number status to completed
  async setNumberCompleted(id: string): Promise<boolean> {
    try {
      const response = await this.makeRequest({
        action: 'setStatus',
        id,
        status: '6' // Status 6 means success completion
      });
      
      return response.success === true;
    } catch (error) {
      console.error('Error setting SMS Activate number as completed:', error);
      throw error;
    }
  },
  
  // Cancel number
  async cancelNumber(id: string): Promise<boolean> {
    try {
      const response = await this.makeRequest({
        action: 'setStatus',
        id,
        status: '8' // Status 8 means cancel
      });
      
      return response.success === true;
    } catch (error) {
      console.error('Error cancelling SMS Activate number:', error);
      throw error;
    }
  },
  
  // Ban number as bad
  async banNumber(id: string): Promise<boolean> {
    try {
      const response = await this.makeRequest({
        action: 'setStatus',
        id,
        status: '10' // Status 10 means report as bad
      });
      
      return response.success === true;
    } catch (error) {
      console.error('Error banning SMS Activate number:', error);
      throw error;
    }
  },
  
  // Helper method to extract code from SMS
  extractCode(text: string): string {
    // Try to find a sequence of 4-6 digits that could be a code
    const match = text.match(/\b\d{4,6}\b/);
    return match ? match[0] : '';
  }
};

// General API to work with any service provider
export const phoneServiceApi = {
  async getProviderBalance(provider: string, apiKey?: string): Promise<{ balance: number; currency: string }> {
    if (provider.toLowerCase().includes('5sim')) {
      return await fiveSimApi.getBalance();
    } else if (provider.toLowerCase().includes('smsactivate')) {
      if (apiKey) {
        smsActivateApi.setApiKey(apiKey);
      }
      const balance = await smsActivateApi.getBalance();
      return { balance, currency: 'RUB' };
    } else {
      throw new Error(`Unsupported provider: ${provider}`);
    }
  },
  
  async getProviderCountries(provider: string, apiKey?: string): Promise<any[]> {
    if (provider.toLowerCase().includes('5sim')) {
      return await fiveSimApi.getCountries();
    } else if (provider.toLowerCase().includes('smsactivate')) {
      if (apiKey) {
        smsActivateApi.setApiKey(apiKey);
      }
      return await smsActivateApi.getCountries();
    } else {
      throw new Error(`Unsupported provider: ${provider}`);
    }
  },
  
  async getProviderProducts(provider: string, country: string, apiKey?: string): Promise<any> {
    if (provider.toLowerCase().includes('5sim')) {
      return await fiveSimApi.getProducts(country);
    } else if (provider.toLowerCase().includes('smsactivate')) {
      if (apiKey) {
        smsActivateApi.setApiKey(apiKey);
      }
      return await smsActivateApi.getServices(country);
    } else {
      throw new Error(`Unsupported provider: ${provider}`);
    }
  }
};
