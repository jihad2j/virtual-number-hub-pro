
import React from 'react';
import { Link } from 'react-router-dom';
import { QuickActionItem } from '@/types/Dashboard';

export const QuickActions: React.FC = () => {
  const quickActions: QuickActionItem[] = [
    {
      id: 1,
      title: 'التفعيل التلقائي',
      icon: <div className="text-xl font-bold">1</div>,
      path: '/dashboard/countries',
      color: 'quick-action-orange'
    },
    {
      id: 2,
      title: 'التفعيل اليدوي',
      icon: <div className="text-xl font-bold">2</div>,
      path: '/dashboard/manual-activation',
      color: 'quick-action-purple'
    },
    {
      id: 3,
      title: 'سجل الخدمات اليدوية',
      icon: <div className="text-xl font-bold">3</div>,
      path: '/dashboard/orders',
      color: 'quick-action-green'
    },
    {
      id: 4,
      title: 'الدعم الفني',
      icon: <div className="text-xl font-bold">4</div>,
      path: '/dashboard/support',
      color: 'quick-action-blue'
    }
  ];

  return (
    <div>
      <h2 className="font-bold text-lg mb-3">أدوات سريعة</h2>
      <div className="grid grid-cols-4 gap-2 text-center">
        {quickActions.map((action) => (
          <Link to={action.path} key={action.id} className="flex flex-col items-center">
            <div className={`quick-action-icon ${action.color}`}>
              {action.icon}
            </div>
            <span className="text-xs">{action.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};
