
// API token for 5sim
const API_TOKEN = "eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NzUwNzkzNjEsImlhdCI6MTc0MzU0MzM2MSwicmF5IjoiYzViYjRjNWNiZjA0N2U2OTI1OWI0YWUzOTM0MmQ1YjQiLCJzdWIiOjEyODQ5OTF9.b1IL-DlhrrOMhcAnq6pxoucrlboVoSbDbjZAI1kcIV63lAr9Kk0WvmE5KQf8a0WH1nkbGZR71i8sCRxCloIVGp08RFVFGsYpSos7flQtzoZs6_TPbuhwJoJKYgPKjNMZVT1Vi9_ywMGRBuOvsbBn6qcAGOCRLKByGuW8PwS7pxmmJbvsB3HD40ek5vFTHpFTxEwVz4OpAOjbmq-Aj6Vz-bz8ymndpIm6D2yGBhRV9aQ4yRrrG-zHZfA-1ayd6vQz969aQIK6sM2tsXRrPKO-hpbF4f7vtsg-RX41DqcZy3t2BWnlB2JwvTB_lLlrm_al0J4k-pqr6lR9TnjsJ3WXBg";
const API_BASE_URL = "https://5sim.net/v1";
const PROXY_URL = ""; // If needed, you can add a proxy server URL here

// Default headers for all requests
const defaultHeaders = {
  "Authorization": `Bearer ${API_TOKEN}`,
  "Accept": "application/json",
  "Content-Type": "application/json",
  "Origin": window.location.origin,
  "Referer": window.location.origin
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
  const url = PROXY_URL ? `${PROXY_URL}${endpoint}` : `${API_BASE_URL}${endpoint}`;
  
  try {
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
      return Object.values(data);
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
