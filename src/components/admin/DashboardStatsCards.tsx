
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, description, icon, gradient }) => (
  <Card className="floating-card border-0 overflow-hidden">
    <div className={`h-1 bg-gradient-to-r ${gradient}`} />
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-6">
      <CardTitle className="text-base font-semibold text-white/90">{title}</CardTitle>
      <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg glow-effect`}>
        <div className="text-white">
          {icon}
        </div>
      </div>
    </CardHeader>
    <CardContent className="pb-6">
      <div className="text-3xl font-bold text-white text-gradient mb-1">{value}</div>
      <p className="text-sm text-white/70 font-medium">
        {description}
      </p>
    </CardContent>
  </Card>
);

interface DashboardStatsCardsProps {
  stats: Array<{
    title: string;
    value: string;
    description: string;
    icon: React.ReactNode;
  }>;
}

export const DashboardStatsCards: React.FC<DashboardStatsCardsProps> = ({ stats }) => {
  const gradients = [
    'from-purple-primary to-purple-secondary',
    'from-emerald-primary to-emerald-secondary',
    'from-purple-accent to-emerald-primary',
    'from-emerald-accent to-purple-primary'
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {stats.map((stat, index) => (
        <div key={index} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
          <StatCard 
            title={stat.title}
            value={stat.value}
            description={stat.description}
            icon={stat.icon}
            gradient={gradients[index % gradients.length]}
          />
        </div>
      ))}
    </div>
  );
};
