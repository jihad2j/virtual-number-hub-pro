
import { apiClient } from '@/services/apiClient';
import { Country } from '@/types/Country';

export const countryApi = {
  async getAllCountries(): Promise<Country[]> {
    const response = await apiClient.get('/countries');
    return response.data.data;
  },

  async getAvailableCountries(): Promise<Country[]> {
    const response = await apiClient.get('/countries/available');
    return response.data.data;
  },

  async createCountry(data: Partial<Country>): Promise<Country> {
    const response = await apiClient.post('/countries', data);
    return response.data.data;
  },

  async deleteCountry(id: string): Promise<void> {
    await apiClient.delete(`/countries/${id}`);
  },

  async getCountry(id: string): Promise<Country> {
    const response = await apiClient.get(`/countries/${id}`);
    return response.data.data;
  },

  async updateCountry(id: string, data: Partial<Country>): Promise<Country> {
    const response = await apiClient.put(`/countries/${id}`, data);
    return response.data.data;
  },

  async addCountries(countries: Partial<Country>[]): Promise<Country[]> {
    const response = await apiClient.post('/countries/bulk', { countries });
    return response.data.data;
  }
};
