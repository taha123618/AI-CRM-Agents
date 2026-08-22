import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 10000,
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
    mutations: {
      retry: 0,
    },
  },
});
