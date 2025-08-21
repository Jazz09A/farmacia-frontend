import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useCurrency } from '../hooks/useCurrency';
import { useAuth } from './AuthContext';
import { Currency } from '../types';

interface AdminCurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  toggleCurrency: () => void;
  formatPrice: (value: number, valueCurrency?: Currency) => string;
  convertPrice: (price: number, fromCurrency: Currency, toCurrency?: Currency) => number;
  getPriceInCurrency: (priceVes: number, priceRef: number) => number;
  getCurrencySymbol: (curr: Currency) => string;
  getCurrencyName: (curr: Currency) => string;
  exchangeRates: {
    VES_TO_REF: number;
    VES_TO_USD: number;
    REF_TO_USD: number;
  };
}

const AdminCurrencyContext = createContext<AdminCurrencyContextType | undefined>(undefined);

export const AdminCurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const currencyHook = useCurrency();
  const { user, isAuthenticated } = useAuth();

  // Establecer la divisa preferida del usuario al cargar
  useEffect(() => {
    if (isAuthenticated && user && user.preferred_currency) {
      // Mapear preferred_currency del usuario a nuestro tipo Currency
      const userCurrency: Currency = user.preferred_currency === 'USD' ? 'USD' : 'VES';
      currencyHook.setCurrency(userCurrency);
    }
  }, [isAuthenticated, user, currencyHook.setCurrency]);

  return (
    <AdminCurrencyContext.Provider value={currencyHook}>
      {children}
    </AdminCurrencyContext.Provider>
  );
};

export const useAdminCurrency = (): AdminCurrencyContextType => {
  const context = useContext(AdminCurrencyContext);
  if (context === undefined) {
    throw new Error('useAdminCurrency must be used within an AdminCurrencyProvider');
  }
  return context;
};
