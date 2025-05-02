
import { apiClient } from '@/services/apiClient';
import { Country } from '@/types/Country';
import { Provider } from '@/types/Provider';

export const initApi = {
  async initLocalData(): Promise<{
    countries: Country[];
    providers: Provider[];
  }> {
    const response = await apiClient.get('/init/local-data');
    return response.data.data;
  }
};
