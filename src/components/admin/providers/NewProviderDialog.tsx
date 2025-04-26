
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Country } from '@/services/api';

interface NewProviderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newProvider: {
    name: string;
    description: string;
    countries: string[];
    isActive: boolean;
    apiKey: string;
    apiUrl: string;
  };
  countries: Country[];
  onNewProviderChange: (field: string, value: any) => void;
  onToggleNewProviderCountry: (countryId: string) => void;
  onAddProvider: () => void;
}

export const NewProviderDialog: React.FC<NewProviderDialogProps> = ({
  open,
  onOpenChange,
  newProvider,
  countries,
  onNewProviderChange,
  onToggleNewProviderCountry,
  onAddProvider,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="gradient-bg">
          <Plus className="ml-2 h-4 w-4" />
          إضافة مزود جديد
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>إضافة مزود خدمة جديد</DialogTitle>
          <DialogDescription>
            أدخل معلومات مزود الخدمة الجديد وحدد الدول المتاحة
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="provider-name">اسم مزود الخدمة</Label>
            <Input
              id="provider-name"
              value={newProvider.name}
              onChange={(e) => onNewProviderChange('name', e.target.value)}
              placeholder="أدخل اسم مزود الخدمة"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="provider-description">وصف مزود الخدمة</Label>
            <Textarea
              id="provider-description"
              value={newProvider.description}
              onChange={(e) => onNewProviderChange('description', e.target.value)}
              placeholder="أدخل وصفًا مختصرًا لمزود الخدمة"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="provider-api-url">عنوان API</Label>
            <Input
              id="provider-api-url"
              value={newProvider.apiUrl}
              onChange={(e) => onNewProviderChange('apiUrl', e.target.value)}
              placeholder="https://api.example.com"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="provider-api-key">مفتاح API</Label>
            <Input
              id="provider-api-key"
              value={newProvider.apiKey}
              onChange={(e) => onNewProviderChange('apiKey', e.target.value)}
              type="password"
              placeholder="أدخل مفتاح API الخاص بالمزود"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="block mb-2">مزود نشط</Label>
            <div className="flex items-center space-x-2">
              <Switch
                checked={newProvider.isActive}
                onCheckedChange={(checked) => onNewProviderChange('isActive', checked)}
              />
              <span className="mr-2">{newProvider.isActive ? 'نشط' : 'غير نشط'}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="block mb-2">الدول المتاحة</Label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {Array.isArray(countries) && countries.length > 0 ? (
                countries.map(country => (
                  <div key={country.id} className="flex items-center space-x-2">
                    <Switch
                      checked={newProvider.countries.includes(country.id)}
                      onCheckedChange={() => onToggleNewProviderCountry(country.id)}
                    />
                    <span className="mr-2">{country.flag} {country.name}</span>
                  </div>
                ))
              ) : (
                <div>لا توجد دول متاحة حاليًا</div>
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button className="gradient-bg" onClick={onAddProvider}>
            إضافة مزود الخدمة
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
