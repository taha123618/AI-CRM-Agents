import { apiClient } from '@/lib/api/client';
import {
  MonteCarloResult,
  PipelineVelocityMatrix,
  ForecastSimulationRecord,
  ArrTrendPoint,
  StageRevenueBreakdown,
} from '../types/forecasting.types';

export const forecastingApi = {
  runMonteCarlo: async (payload: {
    iterations?: number;
    deal_slippage_rate?: number;
    custom_stage_probs?: Record<string, number>;
  }): Promise<MonteCarloResult> => {
    const { data } = await apiClient.post<MonteCarloResult>(
      '/api/forecasting/monte-carlo',
      payload
    );
    return data;
  },

  getPipelineVelocity: async (): Promise<PipelineVelocityMatrix> => {
    const { data } = await apiClient.get<PipelineVelocityMatrix>(
      '/api/forecasting/pipeline-velocity'
    );
    return data;
  },

  getArrTrend: async (): Promise<ArrTrendPoint[]> => {
    const { data } = await apiClient.get<ArrTrendPoint[]>('/api/forecasting/arr-trend');
    return data;
  },

  getStageBreakdown: async (): Promise<StageRevenueBreakdown[]> => {
    const { data } = await apiClient.get<StageRevenueBreakdown[]>(
      '/api/forecasting/stage-breakdown'
    );
    return data;
  },

  saveSimulation: async (payload: {
    name: string;
    target_quarter?: string;
    pipeline_total_value: number;
    iterations: number;
    p10_conservative: number;
    p50_expected: number;
    p90_optimistic: number;
    deal_slippage_rate?: number;
    stage_probabilities?: Record<string, number>;
    distribution_curve?: unknown[];
  }): Promise<{ status: string; simulation_id: string; p50_expected: number }> => {
    const { data } = await apiClient.post('/api/forecasting/simulations', payload);
    return data;
  },

  getSavedSimulations: async (): Promise<ForecastSimulationRecord[]> => {
    const { data } = await apiClient.get<ForecastSimulationRecord[]>(
      '/api/forecasting/simulations'
    );
    return data;
  },

  deleteSimulation: async (id: string): Promise<{ status: string }> => {
    const { data } = await apiClient.delete(`/api/forecasting/simulations/${id}`);
    return data;
  },
};
