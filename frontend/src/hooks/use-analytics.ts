import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: () => api.getDashboardMetrics(),
    staleTime: 15000,
  });
}

export function usePipelineMetrics() {
  return useQuery({
    queryKey: ['pipeline-metrics'],
    queryFn: () => api.getPipelineMetrics(),
    staleTime: 15000,
  });
}

export function useAnalyticsInsights() {
  return useQuery({
    queryKey: ['analytics-insights'],
    queryFn: () => api.getAnalyticsInsights(),
    staleTime: 30000,
  });
}
