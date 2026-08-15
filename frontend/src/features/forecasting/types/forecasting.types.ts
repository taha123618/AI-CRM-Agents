export interface HistogramBucket {
  range_label: string;
  revenue_midpoint: number;
  probability_frequency: number;
  percentage: number;
}

export interface MonteCarloResult {
  target_quarter: string;
  iterations: number;
  pipeline_total_value: number;
  p10_conservative: number;
  p50_expected: number;
  p90_optimistic: number;
  deal_slippage_rate: number;
  stage_probabilities: Record<string, number>;
  distribution_curve: HistogramBucket[];
  deals_evaluated: number;
}

export interface StageVelocityMetric {
  stage: string;
  avg_days_in_stage: number;
  conversion_rate: number;
  slippage_risk: 'Low' | 'Medium' | 'High';
}

export interface PipelineVelocityMatrix {
  win_rate_percentage: number;
  avg_sales_cycle_days: number;
  monthly_velocity_arr: number;
  stages: StageVelocityMetric[];
}

export interface ForecastSimulationRecord {
  id: string;
  name: string;
  target_quarter: string;
  pipeline_total_value: number;
  p10_conservative: number;
  p50_expected: number;
  p90_optimistic: number;
  deal_slippage_rate: number;
  created_at: string;
}
