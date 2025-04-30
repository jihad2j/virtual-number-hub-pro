
import React, { useState, useEffect } from 'react';
import { api, Provider, Country } from '@/services/api';
import { toast } from 'sonner';
import { ProviderCard } from '@/components/admin/providers/ProviderCard';
import { NewProviderDialog } from '@/components/admin/providers/NewProviderDialog';
import { fiveSimApi, phoneServiceApi, smsActivateApi } from '@/services/fiveSimService';

interface ProviderWithCountries extends Provider {
  countries: string[];
}

const Providers = () => {
  const [providers, setProviders] = useState<ProviderWithCountries[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openNewProviderDialog, setOpenNewProviderDialog] = useState(false);
  const [testingProviderConnection, setTestingProviderConnection] = useState<string | null>(null);
  const [connectionStatuses, setConnectionStatuses] = useState<Record<string, boolean>>({});
  const [apiKeyVisible, setApiKeyVisible] = useState<Record<string, boolean>>({});
  const [providerBalances, setProviderBalances] = useState<Record<string, { balance: number; currency: string }>>({});
  const [fetchingBalance, setFetchingBalance] = useState<string | null>(null);
  const [newProvider, setNewProvider] = useState({
    name: '',
    description: '',
    countries: [] as string[],
    isActive: true,
    apiKey: '',
    apiUrl: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [providersData, countriesData] = await Promise.all([
        api.getAllProviders(),
        api.getAllCountries()
      ]);

      // Ensure that all providers have a countries array
      const providersWithCountries = providersData.map(p => ({
        ...p,
        countries: p.countries || []
      }));
      
      setProviders(providersWithCountries);
      setCountries(countriesData || []);
      
      // Test connection for each provider
      for (const provider of providersWithCountries) {
        testProviderConnection(provider.id);
      }
    } catch (error) {
      console.error('Failed to fetch data', error);
      toast.error('فشل في جلب البيانات');
    } finally {
      setIsLoading(false);
    }
  };

  const testProviderConnection = async (providerId: string) => {
    setTestingProviderConnection(providerId);
    try {
      // Find the provider
      const provider = providers.find(p => p.id === providerId);
      if (!provider) return;
      
      let success = false;
      if (provider.name.toLowerCase().includes('5sim')) {
        // Test 5Sim connection
        try {
          const countries = await fiveSimApi.getCountries();
          success = countries.length > 0;
        } catch (error) {
          console.error('Failed to test 5Sim connection:', error);
          success = false;
        }
      } else if (provider.name.toLowerCase().includes('smsactivate')) {
        // Test SMS Activate connection
        try {
          if (provider.apiKey) {
            smsActivateApi.setApiKey(provider.apiKey);
            await smsActivateApi.getBalance();
            success = true;
          }
        } catch (error) {
          console.error('Failed to test SMS Activate connection:', error);
          success = false;
        }
      } else {
        // Test other providers - implement as needed
        success = true; // Placeholder
      }
      
      // Update connection status
      setConnectionStatuses(prev => ({
        ...prev,
        [providerId]: success
      }));
      
      if (success) {
        toast.success(`تم الاتصال بمزود الخدمة ${provider.name} بنجاح`);
        // After successful connection, fetch balance
        fetchProviderBalance(providerId);
      } else {
        toast.error(`فشل الاتصال بمزود الخدمة ${provider.name}`);
      }
    } catch (error) {
      console.error(`Failed to test connection for provider ${providerId}:`, error);
      setConnectionStatuses(prev => ({
        ...prev,
        [providerId]: false
      }));
      toast.error('فشل اختبار الاتصال بالمزود');
    } finally {
      setTestingProviderConnection(null);
    }
  };
  
  const fetchProviderBalance = async (providerId: string) => {
    setFetchingBalance(providerId);
    try {
      const provider = providers.find(p => p.id === providerId);
      if (!provider) return;
      
      let balance = { balance: 0, currency: "Unknown" };
      
      if (provider.name.toLowerCase().includes('5sim')) {
        balance = await phoneServiceApi.getProviderBalance('5sim');
      } else if (provider.name.toLowerCase().includes('smsactivate') && provider.apiKey) {
        balance = await phoneServiceApi.getProviderBalance('smsactivate', provider.apiKey);
      }
      
      setProviderBalances(prev => ({
        ...prev,
        [providerId]: balance
      }));
      
      toast.success(`تم جلب رصيد مزود الخدمة ${provider.name} بنجاح`);
    } catch (error) {
      console.error(`Failed to fetch balance for provider ${providerId}:`, error);
      toast.error('فشل في جلب رصيد المزود');
    } finally {
      setFetchingBalance(null);
    }
  };
  
  const fetchProviderCountries = async (providerId: string) => {
    try {
      const provider = providers.find(p => p.id === providerId);
      if (!provider) return;
      
      toast.info(`جاري جلب الدول المتاحة من ${provider.name}...`);
      
      let fetchedCountries: any[] = [];
      
      // For 5Sim, we'll use our existing API
      if (provider.name.toLowerCase().includes('5sim')) {
        const fiveSimCountries = await phoneServiceApi.getProviderCountries('5sim');
        
        // Convert 5Sim countries to our country format with services property
        const newCountries: Country[] = fiveSimCountries.map((country: any) => ({
          id: country.iso,
          name: country.name,
          flag: getFlagEmoji(country.iso.toUpperCase()),
          code: country.iso,
          available: true,
          services: []
        }));
        
        fetchedCountries = newCountries;
      } 
      // For SMS Activate
      else if (provider.name.toLowerCase().includes('smsactivate') && provider.apiKey) {
        smsActivateApi.setApiKey(provider.apiKey);
        const smsActivateCountries = await smsActivateApi.getCountries();
        
        // Convert SMS Activate countries to our country format with services property
        const newCountries: Country[] = smsActivateCountries.map(country => ({
          id: country.id,
          name: country.name,
          flag: country.code ? getFlagEmoji(country.code.toUpperCase()) : '🌍',
          code: country.code || '',
          available: true,
          services: []
        }));
        
        fetchedCountries = newCountries;
      }
      // For other providers, you'll need to implement their APIs
      else {
        toast.info('هذه الميزة غير متاحة لهذا المزود حاليًا');
        return;
      }
      
      if (fetchedCountries.length > 0) {
        // Add any new countries to our countries list
        const existingCountryCodes = countries.map(c => c.code);
        const uniqueNewCountries = fetchedCountries.filter(c => !existingCountryCodes.includes(c.code));
        
        if (uniqueNewCountries.length > 0) {
          // Implement the missing addCountries function with a batch create
          for (const country of uniqueNewCountries) {
            await api.createCountry(country);
          }
          
          const updatedCountries = await api.getAllCountries();
          setCountries(updatedCountries);
          toast.success(`تم إضافة ${uniqueNewCountries.length} دولة جديدة`);
        } else {
          toast.info('لم يتم العثور على دول جديدة');
        }
      } else {
        toast.warning('لم يتم العثور على أي دول');
      }
    } catch (error) {
      console.error(`Failed to fetch countries from provider ${providerId}:`, error);
      toast.error('فشل في جلب الدول من المزود');
    }
  };
  
  // Helper function to get flag emoji from country code
  const getFlagEmoji = (countryCode: string) => {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };
  
  const toggleApiKeyVisibility = (providerId: string) => {
    setApiKeyVisible(prev => ({
      ...prev,
      [providerId]: !prev[providerId]
    }));
  };

  const handleToggleCountry = (providerId: string, countryId: string) => {
    setProviders(providers.map(provider => {
      if (provider.id === providerId) {
        const updatedCountries = provider.countries.includes(countryId)
          ? provider.countries.filter(id => id !== countryId)
          : [...provider.countries, countryId];
        
        return { ...provider, countries: updatedCountries };
      }
      return provider;
    }));
  };

  const handleToggleProviderActive = (providerId: string) => {
    setProviders(providers.map(provider => {
      if (provider.id === providerId) {
        return { ...provider, isActive: !provider.isActive };
      }
      return provider;
    }));
  };

  const handleSaveProvider = async (provider: ProviderWithCountries) => {
    try {
      await api.updateProvider(provider);
      toast.success(`تم تحديث مزود الخدمة ${provider.name} بنجاح`);
    } catch (error) {
      console.error('Failed to save provider', error);
      toast.error('حدث خطأ أثناء حفظ مزود الخدمة');
    }
  };

  const handleAddProvider = async () => {
    if (!newProvider.name) {
      toast.error('الرجاء إدخال اسم مزود الخدمة');
      return;
    }

    try {
      // Create a new provider object with required fields
      const providerToCreate = {
        name: newProvider.name,
        description: newProvider.description,
        slug: newProvider.name.toLowerCase().replace(/\s+/g, '-'),
        apiKey: newProvider.apiKey,
        baseUrl: newProvider.apiUrl,
        settings: {},
        isActive: newProvider.isActive,
        priority: 0,
        countries: newProvider.countries
      };
      
      const addedProvider = await api.createProvider(providerToCreate);
      
      // Ensure the added provider has a countries array
      const providerWithCountries = {
        ...addedProvider,
        countries: newProvider.countries || []
      };
      
      setProviders([...providers, providerWithCountries]);
      setNewProvider({
        name: '',
        description: '',
        countries: [],
        isActive: true,
        apiKey: '',
        apiUrl: '',
      });
      setOpenNewProviderDialog(false);
      toast.success(`تم إضافة مزود الخدمة ${addedProvider.name} بنجاح`);
      
      testProviderConnection(addedProvider.id);
    } catch (error) {
      console.error('Failed to add provider', error);
      toast.error('حدث خطأ أثناء إضافة مزود الخدمة');
    }
  };

  const handleNewProviderChange = (field: string, value: any) => {
    setNewProvider(prev => ({ ...prev, [field]: value }));
  };

  const handleToggleNewProviderCountry = (countryId: string) => {
    setNewProvider(prev => {
      const updatedCountries = prev.countries.includes(countryId)
        ? prev.countries.filter(id => id !== countryId)
        : [...prev.countries, countryId];
      
      return { ...prev, countries: updatedCountries };
    });
  };

  const handleToggleApiKey = (providerId: string) => {
    setApiKeyVisible(prev => ({
      ...prev,
      [providerId]: !prev[providerId]
    }));
  };

  const handleUpdateProvider = (updatedProvider: ProviderWithCountries) => {
    setProviders(providers.map(p => 
      p.id === updatedProvider.id ? updatedProvider : p
    ));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">إدارة مزودي الخدمة</h1>
        <NewProviderDialog
          open={openNewProviderDialog}
          onOpenChange={setOpenNewProviderDialog}
          newProvider={newProvider}
          countries={countries}
          onNewProviderChange={handleNewProviderChange}
          onToggleNewProviderCountry={handleToggleNewProviderCountry}
          onAddProvider={handleAddProvider}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {Array.isArray(providers) && providers.map(provider => (
          <ProviderCard
            key={provider.id}
            provider={provider}
            countries={countries}
            connectionStatus={connectionStatuses[provider.id]}
            apiKeyVisible={apiKeyVisible[provider.id]}
            providerBalance={providerBalances[provider.id]}
            testingConnection={testingProviderConnection === provider.id}
            fetchingBalance={fetchingBalance === provider.id}
            onToggleCountry={handleToggleCountry}
            onToggleActive={handleToggleProviderActive}
            onSave={handleSaveProvider}
            onTestConnection={testProviderConnection}
            onFetchCountries={fetchProviderCountries}
            onFetchBalance={fetchProviderBalance}
            onToggleApiKey={handleToggleApiKey}
            onUpdateProvider={handleUpdateProvider}
          />
        ))}
      </div>
    </div>
  );
};

export default Providers;
