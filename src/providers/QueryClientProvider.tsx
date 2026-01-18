import React from 'react';
import { QueryClient, QueryClientProvider as RQProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
      refetchOnMount: false,
      retry: 2,
    },
    mutations: {
      retry: 0,
    },
  },
});

export const QueryClientProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <RQProvider client={queryClient}>
      {children}
      {import.meta.env.DEV ? <ReactQueryDevtools initialIsOpen={false} /> : null}
    </RQProvider>
  );
};

export default QueryClientProvider;


