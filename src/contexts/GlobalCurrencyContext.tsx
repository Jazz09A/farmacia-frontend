import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useCurrency } from '../hooks/useCurrency';
import { useAuth } from './AuthContext';
import { Currency } from '../types';

interface GlobalCurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  toggleCurrency: () => void;
  formatPrice: (value: number, valueCurrency?: Currency) => string;
  convertPrice: (price: string | number, fromCurrency: Currency, toCurrency?: Currency) => number;
  getDisplayPrice: (priceUsd: string | number, displayCurrency?: Currency) => number;
  formatPriceFromBackend: (priceUsd: string | number, displayCurrency?: Currency) => string;
  getCurrencySymbol: (curr: Currency) => string;
  getCurrencyName: (curr: Currency) => string;
  exchangeRates: {
    USD_TO_VES: number;
    VES_TO_USD: number;
  };
  exchangeRateData: any;
  isLoadingRates: boolean;
  refreshExchangeRates: () => Promise<void>;
}

const GlobalCurrencyContext = createContext<GlobalCurrencyContextType | undefined>(undefined);

interface GlobalCurrencyProviderProps {
  children: ReactNode;
  userPreferredCurrency?: string;
  isAuthenticated?: boolean;
}

export const GlobalCurrencyProvider: React.FC<GlobalCurrencyProviderProps> = ({ 
  children, 
  userPreferredCurrency, 
  isAuthenticated 
}) => {
  const currencyHook = useCurrency();

  // Set user's preferred currency when loading
  useEffect(() => {
    if (isAuthenticated && userPreferredCurrency) {
      // Map user's preferred_currency to our Currency type
      // REF is treated as USD since they are synonymous
      const userCurrency: Currency = (userPreferredCurrency === 'USD') ? 'USD' : 'VES';
      currencyHook.setCurrency(userCurrency);
    }
  }, [isAuthenticated, userPreferredCurrency, currencyHook.setCurrency]);

  return (
    <GlobalCurrencyContext.Provider value={currencyHook}>
      {children}
    </GlobalCurrencyContext.Provider>
  );
};

// Wrapper component that uses useAuth and passes data to GlobalCurrencyProvider
export const GlobalCurrencyProviderWithAuth: React.FC<{ children: ReactNode }> = ({ children }) => {
  // This will be used in App.tsx where useAuth is available
  const { user, isAuthenticated } = useAuth();
  
  return (
    <GlobalCurrencyProvider
      userPreferredCurrency={user?.preferred_currency}
      isAuthenticated={isAuthenticated}
    >
      {children}
    </GlobalCurrencyProvider>
  );
};

export const useGlobalCurrency = (): GlobalCurrencyContextType => {
  const context = useContext(GlobalCurrencyContext);
  if (context === undefined) {
    throw new Error('useGlobalCurrency must be used within a GlobalCurrencyProvider');
  }
  return context;
};
