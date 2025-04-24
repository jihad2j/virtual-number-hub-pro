// API token for 5sim
const API_TOKEN = "eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NzUwNzkzNjEsImlhdCI6MTc0MzU0MzM2MSwicmF5IjoiYzViYjRjNWNiZjA0N2U2OTI1OWI0YWUzOTM0MmQ1YjQiLCJzdWIiOjEyODQ5OTF9.b1IL-DlhrrOMhcAnq6pxoucrlboVoSbDbjZAI1kcIV63lAr9Kk0WvmE5KQf8a0WH1nkbGZR71i8sCRxCloIVGp08RFVFGsYpSos7flQtzoZs6_TPbuhwJoJKYgPKjNMZVT1Vi9_ywMGRBuOvsbBn6qcAGOCRLKByGuW8PwS7pxmmJbvsB3HD40ek5vFTHpFTxEwVz4OpAOjbmq-Aj6Vz-bz8ymndpIm6D2yGBhRV9aQ4yRrrG-zHZfA-1ayd6vQz969aQIK6sM2tsXRrPKO-hpbF4f7vtsg-RX41DqcZy3t2BWnlB2JwvTB_lLlrm_al0J4k-pqr6lR9TnjsJ3WXBg";
const API_BASE_URL = "https://5sim.net/v1";

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
  sms: any[];
  created_at: string;
  country: string;
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

// 5sim service implementation
export const fiveSimApi = {
  // Get list of available countries
  getCountries: async (): Promise<FiveSimCountry[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/guest/countries`, {
        method: "GET",
        headers: defaultHeaders,
        mode: 'cors'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch countries. Status: ${response.status}`);
      }

      const data = await response.json();
      return Object.values(data);
    } catch (error) {
      console.error("Error fetching countries list from 5sim:", error);
      throw error;
    }
  },

  // Get available products for a country
  getProducts: async (country: string, operator: string = "any"): Promise<Record<string, FiveSimProduct>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/guest/products/${country}/${operator}`, {
        method: "GET",
        headers: defaultHeaders,
        mode: 'cors'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch products. Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching products from 5sim for country ${country}:`, error);
      throw error;
    }
  },

  // Purchase a number
  purchaseNumber: async (country: string, operator: string, product: string): Promise<FiveSimPhoneNumber> => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/buy/activation/${country}/${operator}/${product}`, {
        method: "GET",
        headers: defaultHeaders,
        mode: 'cors'
      });

      if (!response.ok) {
        throw new Error(`Failed to purchase number. Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error purchasing number from 5sim:`, error);
      throw error;
    }
  },

  // Check number status
  checkNumber: async (id: number): Promise<FiveSimPhoneNumber> => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/check/${id}`, {
        method: "GET",
        headers: defaultHeaders,
        mode: 'cors'
      });

      if (!response.ok) {
        throw new Error(`Failed to check number. Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error checking number status from 5sim:`, error);
      throw error;
    }
  },

  // Set number status to "finished"
  finishNumber: async (id: number): Promise<FiveSimPhoneNumber> => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/finish/${id}`, {
        method: "GET",
        headers: defaultHeaders,
        mode: 'cors'
      });

      if (!response.ok) {
        throw new Error(`Failed to finish number. Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error finishing number from 5sim:`, error);
      throw error;
    }
  },

  // Cancel number
  cancelNumber: async (id: number): Promise<FiveSimPhoneNumber> => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/cancel/${id}`, {
        method: "GET",
        headers: defaultHeaders,
        mode: 'cors'
      });

      if (!response.ok) {
        throw new Error(`Failed to cancel number. Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error cancelling number from 5sim:`, error);
      throw error;
    }
  },

  // Get account balance and profile
  getProfile: async (): Promise<FiveSimUserProfile> => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: "GET",
        headers: defaultHeaders,
        mode: 'cors'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch profile. Status: ${response.status}`);
      }

      return await response.json();
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
  }
};
