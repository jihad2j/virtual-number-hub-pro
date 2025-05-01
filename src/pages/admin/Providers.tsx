
import React, { useState, useEffect } from 'react';
import { api, Provider, Country } from '@/services/api';
import { toast } from 'sonner';
import { ProviderCard } from '@/components/admin/providers/ProviderCard';
import { NewProviderDialog } from '@/components/admin/providers/NewProviderDialog';
import { fiveSimApi, phoneServiceApi, smsActivateApi } from '@/services/fiveSimService';

const Providers = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
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
    code: '', // Added code field which is required
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
      setProviders(providersData);
      setCountries(countriesData || []);
      
      // Test connection for each provider
      for (const provider of providersData) {
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
      
      // Use the backend API for testing connection
      const success = await api.testProviderConnection(providerId);
      
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
      const balance = await api.getProviderBalance(providerId);
      
      setProviderBalances(prev => ({
        ...prev,
        [providerId]: balance
      }));
      
      const provider = providers.find(p => p.id === providerId);
      toast.success(`تم جلب رصيد مزود الخدمة ${provider?.name} بنجاح`);
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
      
      const fetchedCountries = await api.getProviderCountries(providerId);
      
      if (fetchedCountries.length > 0) {
        // Process countries to match our format
        const formattedCountries = fetchedCountries.map(country => ({
          id: country.id || country.iso || country.code,
          name: country.name,
          code: country.iso || country.code,
          flag: country.flag || getFlagEmoji(country.code?.toUpperCase() || country.iso?.toUpperCase()),
          services: [] // Adding required services field
        }));
        
        // Add any new countries to our database
        try {
          await api.addCountries(formattedCountries);
          // Refresh country list
          const updatedCountries = await api.getAllCountries();
          setCountries(updatedCountries);
          toast.success(`تم جلب وتحديث الدول المتاحة`);
        } catch (e) {
          console.error('Failed to add countries to database', e);
          toast.error('فشل في إضافة الدول إلى قاعدة البيانات');
        }
      } else {
        toast.warning('لم يتم العثور على أي دول من هذا المزود');
      }
    } catch (error) {
      console.error(`Failed to fetch countries from provider ${providerId}:`, error);
      toast.error('فشل في جلب الدول من المزود');
    }
  };
  
  // Helper function to get flag emoji from country code
  const getFlagEmoji = (countryCode: string) => {
    if (!countryCode) return '🌍';
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
        const updatedCountries = provider.countries?.includes(countryId)
          ? provider.countries.filter(id => id !== countryId)
          : [...(provider.countries || []), countryId];
        
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

  const handleSaveProvider = async (provider: Provider) => {
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

    if (!newProvider.code) {
      // Generate a code from name if not provided
      newProvider.code = newProvider.name.toLowerCase().replace(/\s+/g, '');
    }

    try {
      const addedProvider = await api.createProvider(newProvider);
      setProviders([...providers, addedProvider]);
      setNewProvider({
        name: '',
        code: '',
        description: '',
        countries: [],
        isActive: true,
        apiKey: '',
        apiUrl: '',
      });
      setOpenNewProviderDialog(false);
      toast.success(`تم إضافة مزود الخدمة ${addedProvider.name} بنجاح`);
      
      // Test the connection of the new provider
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

  const handleUpdateProvider = (updatedProvider: Provider) => {
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
