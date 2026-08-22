export interface LifecycleStage {
  id: string;
  label: string;
  color: string;
}

export interface JourneyCustomer {
  id: string;
  name: string;
  health_score: number;
  mrr: number;
  arr: number;
  churn_risk_pct: number;
  status: string;
}

export interface StageDistribution {
  count: number;
  total_arr: number;
  customers: JourneyCustomer[];
}

export interface JourneyStagesResponse {
  stages: LifecycleStage[];
  distribution: Record<string, StageDistribution>;
  summary: {
    total_customers: number;
    total_arr: number;
    at_risk_arr: number;
    at_risk_count: number;
    expansion_arr: number;
  };
}

export interface JourneyTimelineItem {
  event: string;
  date: string;
  status: 'completed' | 'in_progress' | 'flagged' | 'pending';
}

export interface JourneyIntervention {
  id: string;
  customer_id: string;
  customer_name: string;
  intervention_type: string;
  status: string;
  target_agent: string;
  triggered_reason: string;
  action_summary: string;
  created_at: string;
}

export interface CustomerJourneyDetails {
  customer_id: string;
  customer_name: string;
  current_health_score: number;
  mrr: number;
  arr: number;
  churn_probability: number;
  lifecycle_stage: string;
  timeline: JourneyTimelineItem[];
  active_interventions: JourneyIntervention[];
  recommended_plays: string[];
}

export interface TriggerInterventionPayload {
  customer_id: string;
  intervention_type: string;
  custom_notes?: string;
}
