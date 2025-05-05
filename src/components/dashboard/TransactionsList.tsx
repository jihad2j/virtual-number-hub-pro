
import React from 'react';
import { Button } from "@/components/ui/button";
import { CreditCard, ArrowLeft, Smartphone } from 'lucide-react';

interface Transaction {
  id: number;
  title: string;
  amount: number;
  type: string;
  date: string;
  icon: React.ReactNode;
}

interface TransactionsListProps {
  transactions: Transaction[];
}

export const TransactionsList: React.FC<TransactionsListProps> = ({ transactions }) => {
  // Render transaction icon based on type
  const renderTransactionIcon = (type: string, icon: React.ReactNode) => {
    const bgColorClass = type === 'purchase' ? 'bg-red-500' : 
                         type === 'transfer' ? 'bg-green-500' : 
                         'bg-blue-500';
    
    return (
      <div className={`${bgColorClass} rounded-full p-2`}>
        {icon}
      </div>
    );
  };

  // Render transaction amount with proper styling
  const renderTransactionAmount = (amount: number) => {
    const isPositive = amount > 0;
    return (
      <div className={`font-bold ${isPositive ? 'transaction-positive' : 'transaction-negative'}`}>
        {isPositive ? `+ ${amount}` : `- ${Math.abs(amount)}`} ر.س
      </div>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <Button 
          variant="link" 
          className="text-app-blue p-0" 
          onClick={() => window.location.href = '/dashboard/balance'}
        >
          عرض الكل
        </Button>
        <h2 className="font-bold text-lg">آخر العمليات</h2>
      </div>
      
      <div className="space-y-3">
        {transactions.map(transaction => (
          <div key={transaction.id} className="bg-white p-3 rounded-xl flex justify-between items-center shadow-sm">
            <div className="flex items-center">
              {renderTransactionIcon(transaction.type, transaction.icon)}
              <div className="mr-3">
                <div className="font-medium">{transaction.title}</div>
                <div className="text-xs text-gray-500">{transaction.date}</div>
              </div>
            </div>
            {renderTransactionAmount(transaction.amount)}
          </div>
        ))}
      </div>
    </div>
  );
};
