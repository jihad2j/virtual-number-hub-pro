
import React from 'react';

export interface Transaction {
  id: number;
  title: string;
  amount: number;
  type: string;
  date: string;
  icon: React.ReactNode;
  username?: string;
  status?: string;
  createdAt?: string;
}

export interface DashboardStats {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}

export interface ChartDataPoint {
  name: string;
  sales: number;
}
