import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider as RQProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: 3,
      retryOnMount: true,
    },
    mutations: {
      retry: 0,
    },
  },
});

export const QueryClientProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  useEffect(() => {
    // Debug: confirmar montaje del provider
    console.log('[RQ] QueryClientProvider mounted');
  }, []);
  return (
    <RQProvider client={queryClient}>
      {import.meta.env.DEV ? <div style={{ display: 'none' }}>{console.log('[RQ] DevTools enabled')}</div> : null}
      {children}
      {import.meta.env.DEV ? <ReactQueryDevtools initialIsOpen={false} /> : null}
    </RQProvider>
  );
};

export default QueryClientProvider;


