
import React from 'react';
import { Server, Globe, Save, Wallet, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Provider, Country } from '@/services/api';

// Extended Provider interface to include required properties
interface ProviderWithCountries extends Provider {
  description?: string;
  apiUrl?: string;
  countries: string[];
}

interface ProviderCardProps {
  provider: ProviderWithCountries;
  countries: Country[];
  connectionStatus: boolean;
  apiKeyVisible: boolean;
  providerBalance: { balance: number; currency: string } | undefined;
  testingConnection: boolean;
  fetchingBalance: boolean;
  onToggleCountry: (providerId: string, countryId: string) => void;
  onToggleActive: (providerId: string) => void;
  onSave: (provider: ProviderWithCountries) => void;
  onTestConnection: (providerId: string) => void;
  onFetchCountries: (providerId: string) => void;
  onFetchBalance: (providerId: string) => void;
  onToggleApiKey: (providerId: string) => void;
  onUpdateProvider: (provider: ProviderWithCountries) => void;
}

export const ProviderCard: React.FC<ProviderCardProps> = ({
  provider,
  countries,
  connectionStatus,
  apiKeyVisible,
  providerBalance,
  testingConnection,
  fetchingBalance,
  onToggleCountry,
  onToggleActive,
  onSave,
  onTestConnection,
  onFetchCountries,
  onFetchBalance,
  onToggleApiKey,
  onUpdateProvider,
}) => {
  return (
    <Card key={provider.id}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
              connectionStatus ? 'bg-green-100' : 'bg-brand-100'
            }`}>
              <Server className={`h-5 w-5 ${
                connectionStatus ? 'text-green-600' : 'text-brand-600'
              }`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle>{provider.name}</CardTitle>
                <Badge className={connectionStatus ? 'bg-green-500' : 'bg-red-500'}>
                  {connectionStatus ? 'متصل' : 'غير متصل'}
                </Badge>
                
                {providerBalance && (
                  <Badge className="bg-blue-500 mr-2">
                    <Wallet className="h-3 w-3 ml-1" />
                    {providerBalance.balance} 
                    {" "}
                    {providerBalance.currency}
                  </Badge>
                )}
              </div>
              <CardDescription>{provider.description || ''}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={provider.isActive}
              onCheckedChange={() => onToggleActive(provider.id)}
            />
            <span>{provider.isActive ? 'نشط' : 'غير نشط'}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center border-b pb-2">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-gray-500" />
                <h3 className="font-medium">إعدادات API</h3>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={testingConnection ? 'animate-pulse' : ''}
                  onClick={() => onTestConnection(provider.id)}
                >
                  <RefreshCw className="h-4 w-4 ml-2" />
                  اختبار الاتصال
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onFetchCountries(provider.id)}
                >
                  <Globe className="h-4 w-4 ml-2" />
                  جلب الدول
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={fetchingBalance ? 'animate-pulse' : ''}
                  onClick={() => onFetchBalance(provider.id)}
                >
                  <Wallet className="h-4 w-4 ml-2" />
                  جلب الرصيد
                </Button>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor={`api-url-${provider.id}`}>عنوان API</Label>
                <Input
                  id={`api-url-${provider.id}`}
                  value={provider.apiUrl || ''}
                  onChange={(e) => onUpdateProvider({ ...provider, apiUrl: e.target.value })}
                  placeholder="https://api.example.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`api-key-${provider.id}`}>مفتاح API</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id={`api-key-${provider.id}`}
                      value={provider.apiKey || ''}
                      onChange={(e) => onUpdateProvider({ ...provider, apiKey: e.target.value })}
                      type={apiKeyVisible ? 'text' : 'password'}
                      placeholder="أدخل مفتاح API الخاص بالمزود"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => onToggleApiKey(provider.id)}
                  >
                    {apiKeyVisible ? "إخفاء" : "إظهار"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t pt-3">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="h-5 w-5 text-gray-500" />
              <h3 className="font-medium">الدول المتاحة ({provider.countries.length})</h3>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Array.isArray(countries) && countries.length > 0 ? (
                countries.map(country => (
                  <div 
                    key={country.id} 
                    className="flex items-center space-x-2"
                  >
                    <Switch
                      checked={provider.countries.includes(country.id)}
                      onCheckedChange={() => onToggleCountry(provider.id, country.id)}
                    />
                    <span className="mr-2">
                      {country.flag} {country.name}
                    </span>
                  </div>
                ))
              ) : (
                <div>لا توجد دول متاحة حاليًا</div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button 
          variant="default" 
          onClick={() => onSave(provider)}
        >
          <Save className="ml-2 h-4 w-4" />
          حفظ التغييرات
        </Button>
      </CardFooter>
    </Card>
  );
};
