
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardStats {
  balance: number | null;
  countriesCount: number;
  purchasedNumbersCount: number;
  activePurchasesCount: string | null;
  isLoadingBalance: boolean;
  isLoadingCountries: boolean;
  balanceError: string | null;
  countriesError: string | null;
}

export const useDashboardStats = (): DashboardStats => {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [countriesCount, setCountriesCount] = useState(0);
  const [purchasedNumbersCount] = useState(0);
  const [activePurchasesCount] = useState<string | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [countriesError, setCountriesError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setBalance(user.balance || 0);
    }
  }, [user]);

  useEffect(() => {
    // Simulate loading countries
    setIsLoadingCountries(true);
    setTimeout(() => {
      setCountriesCount(50); // Default value
      setIsLoadingCountries(false);
    }, 1000);
  }, []);

  return {
    balance,
    countriesCount,
    purchasedNumbersCount,
    activePurchasesCount,
    isLoadingBalance,
    isLoadingCountries,
    balanceError,
    countriesError,
  };
};
