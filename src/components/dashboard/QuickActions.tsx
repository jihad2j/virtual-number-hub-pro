
import React from 'react';
import { Grid, Zap, Smartphone, ArrowLeft } from 'lucide-react';

export const QuickActions: React.FC = () => {
  return (
    <div>
      <h2 className="font-bold text-lg mb-3">أدوات سريعة</h2>
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="flex flex-col items-center">
          <div className="quick-action-icon quick-action-orange">
            <Grid className="h-5 w-5 text-orange-500" />
          </div>
          <span className="text-xs">مسح</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="quick-action-icon quick-action-purple">
            <Zap className="h-5 w-5 text-purple-500" />
          </div>
          <span className="text-xs">فواتير</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="quick-action-icon quick-action-green">
            <Smartphone className="h-5 w-5 text-green-500" />
          </div>
          <span className="text-xs">شحن</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="quick-action-icon quick-action-blue">
            <ArrowLeft className="h-5 w-5 text-blue-500" />
          </div>
          <span className="text-xs">تحويل</span>
        </div>
      </div>
    </div>
  );
};
