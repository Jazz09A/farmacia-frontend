import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useCurrency } from '../hooks/useCurrency';
import { useAuth } from './AuthContext';
import { Currency } from '../types';

interface GlobalCurrencyContextType {
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

const GlobalCurrencyContext = createContext<GlobalCurrencyContextType | undefined>(undefined);

export const GlobalCurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const currencyHook = useCurrency();
  const { user, isAuthenticated } = useAuth();

  // Set user's preferred currency when loading
  useEffect(() => {
    if (isAuthenticated && user && user.preferred_currency) {
      // Map user's preferred_currency to our Currency type
      const userCurrency: Currency = user.preferred_currency === 'USD' ? 'USD' : 'VES';
      currencyHook.setCurrency(userCurrency);
    }
  }, [isAuthenticated, user, currencyHook.setCurrency]);

  return (
    <GlobalCurrencyContext.Provider value={currencyHook}>
      {children}
    </GlobalCurrencyContext.Provider>
  );
};

export const useGlobalCurrency = (): GlobalCurrencyContextType => {
  const context = useContext(GlobalCurrencyContext);
  if (context === undefined) {
    throw new Error('useGlobalCurrency must be used within a GlobalCurrencyProvider');
  }
  return context;
};
