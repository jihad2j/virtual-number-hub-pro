
// API token for 5sim
const API_TOKEN = "eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NzUwNzkzNjEsImlhdCI6MTc0MzU0MzM2MSwicmF5IjoiYzViYjRjNWNiZjA0N2U2OTI1OWI0YWUzOTM0MmQ1YjQiLCJzdWIiOjEyODQ5OTF9.b1IL-DlhrrOMhcAnq6pxoucrlboVoSbDbjZAI1kcIV63lAr9Kk0WvmE5KQf8a0WH1nkbGZR71i8sCRxCloIVGp08RFVFGsYpSos7flQtzoZs6_TPbuhwJoJKYgPKjNMZVT1Vi9_ywMGRBuOvsbBn6qcAGOCRLKByGuW8PwS7pxmmJbvsB3HD40ek5vFTHpFTxEwVz4OpAOjbmq-Aj6Vz-bz8ymndpIm6D2yGBhRV9aQ4yRrrG-zHZfA-1ayd6vQz969aQIK6sM2tsXRrPKO-hpbF4f7vtsg-RX41DqcZy3t2BWnlB2JwvTB_lLlrm_al0J4k-pqr6lR9TnjsJ3WXBg";
const API_BASE_URL = "https://5sim.net/v1";

// الأنواع المستخدمة في API
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

// تنفيذ خدمة 5sim
export const fiveSimApi = {
  // الحصول على قائمة الدول المتاحة
  getCountries: async (): Promise<FiveSimCountry[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/guest/countries`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${API_TOKEN}`,
          "Accept": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`فشل جلب الدول. الرمز: ${response.status}`);
      }

      const data = await response.json();
      return Object.values(data);
    } catch (error) {
      console.error("خطأ في جلب قائمة الدول من 5sim:", error);
      throw error;
    }
  },

  // الحصول على المنتجات المتاحة للدولة
  getProducts: async (country: string, operator: string = "any"): Promise<Record<string, FiveSimProduct>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/guest/products/${country}/${operator}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${API_TOKEN}`,
          "Accept": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`فشل جلب المنتجات. الرمز: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`خطأ في جلب المنتجات من 5sim للدولة ${country}:`, error);
      throw error;
    }
  },

  // شراء رقم
  purchaseNumber: async (country: string, operator: string, product: string): Promise<FiveSimPhoneNumber> => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/buy/activation/${country}/${operator}/${product}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${API_TOKEN}`,
          "Accept": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`فشل شراء الرقم. الرمز: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`خطأ في شراء رقم من 5sim:`, error);
      throw error;
    }
  },

  // الحصول على حالة الرقم
  checkNumber: async (id: number): Promise<FiveSimPhoneNumber> => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/check/${id}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${API_TOKEN}`,
          "Accept": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`فشل التحقق من الرقم. الرمز: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`خطأ في التحقق من حالة الرقم من 5sim:`, error);
      throw error;
    }
  },

  // تعيين حالة الرقم إلى "انتهى"
  finishNumber: async (id: number): Promise<FiveSimPhoneNumber> => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/finish/${id}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${API_TOKEN}`,
          "Accept": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`فشل إنهاء الرقم. الرمز: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`خطأ في إنهاء الرقم من 5sim:`, error);
      throw error;
    }
  },

  // إلغاء الرقم
  cancelNumber: async (id: number): Promise<FiveSimPhoneNumber> => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/cancel/${id}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${API_TOKEN}`,
          "Accept": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`فشل إلغاء الرقم. الرمز: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`خطأ في إلغاء الرقم من 5sim:`, error);
      throw error;
    }
  },

  // الحصول على الرصيد
  getBalance: async (): Promise<{ balance: number; currency: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${API_TOKEN}`,
          "Accept": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`فشل جلب الرصيد. الرمز: ${response.status}`);
      }

      const data = await response.json();
      return { balance: data.balance, currency: "RUB" };
    } catch (error) {
      console.error(`خطأ في جلب الرصيد من 5sim:`, error);
      throw error;
    }
  }
};
