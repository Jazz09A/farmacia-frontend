import React, { createContext, useContext, ReactNode } from 'react';
import { useScrollToTop } from '../hooks/useScrollToTop';

interface ScrollContextType {
  scrollToTop: (options?: { smooth?: boolean; offset?: number }) => void;
  scrollToElement: (elementId: string, options?: { smooth?: boolean; offset?: number }) => void;
}

const ScrollContext = createContext<ScrollContextType | undefined>(undefined);

export const ScrollProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const scrollMethods = useScrollToTop();

  return (
    <ScrollContext.Provider value={scrollMethods}>
      {children}
    </ScrollContext.Provider>
  );
};

export const useScrollContext = (): ScrollContextType => {
  const context = useContext(ScrollContext);
  if (context === undefined) {
    throw new Error('useScrollContext must be used within a ScrollProvider');
  }
  return context;
};

export default ScrollContext; 