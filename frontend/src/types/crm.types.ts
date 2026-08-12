/**
 * TypeScript Type Definitions for AI-Powered CRM
 * Matching database models, API schemas, and Agent events
 */

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'unqualified' | 'lost';
export type DealStage = 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
export type ChurnRisk = 'low' | 'medium' | 'high';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type Sentiment = 'positive' | 'neutral' | 'negative';
export type MeetingStatus = 'scheduled' | 'completed' | 'cancelled';

export interface Lead {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  company_name?: string | null;
  job_title?: string | null;
  lead_score: number;
  lead_status: LeadStatus;
  lead_source?: string | null;
  created_at?: string;
  // AI LeadQualificationAgent enriched fields
  buying_signals?: string[] | null;
  routing_team?: string | null;
  recommended_action?: string | null;
}

export interface LeadCreate {
  email: string;
  first_name?: string;
  last_name?: string;
  company_name?: string;
  job_title?: string;
  lead_source?: string;
}

export interface Deal {
  id: string;
  name: string;
  value: number;
  stage: DealStage;
  health_score: number;
  is_stalled: boolean;
  risk_factors?: string[] | null;
  contact_id?: string | null;
  company_id?: string | null;
  created_at?: string;
  // AI SalesPipelineAgent enriched fields
  close_probability?: number | null;
  next_actions?: string[] | null;
  forecast_close_date?: string | null;
}

export interface DealCreate {
  name: string;
  value: number;
  stage: DealStage;
  contact_id?: string;
  company_id?: string;
}

export interface Customer {
  id: string;
  plan: string;
  mrr: number;
  health_score: number;
  churn_risk: ChurnRisk;
  churn_probability?: number;
  logins_per_week?: number;
  features_used?: number;
  license_usage_percent?: number;
  daily_active_users?: number;
  // AI CustomerSuccessAgent enriched fields
  recommended_actions?: string[] | null;
}

export interface CustomerHealth {
  health_score: number;
  churn_risk: ChurnRisk;
  churn_probability: number;
  engagement: {
    logins_per_week: number;
    features_used: number;
    license_usage_percent: number;
  };
}

export interface EmailMessage {
  id: string;
  subject: string;
  sentiment: Sentiment;
  category: string;
  priority: Priority;
  draft_response?: string | null;
  response_sent?: boolean;
  received_at?: string | null;
  // AI EmailIntelligenceAgent enriched fields
  sentiment_score?: number | null;
  emotion?: string | null;
  follow_up_suggestions?: string[] | null;
}

export interface Meeting {
  id: string;
  title: string;
  meeting_type: string;
  scheduled_at: string;
  duration_minutes?: number;
  location?: string;
  agenda?: string[] | any;
  prep_materials?: any;
  notes?: string;
  status: MeetingStatus;
  // AI MeetingSchedulerAgent enriched fields
  attendees?: string[] | any;
  followup_tasks?: string[] | null;
}

export interface DashboardMetrics {
  leads: {
    total: number;
    qualified: number;
  };
  deals: {
    total: number;
    pipeline_value: number;
    avg_health_score?: number;
    stalled_count?: number;
  };
  customers: {
    total: number;
    mrr: number;
    arr: number;
  };
}

export interface StageMetric {
  count: number;
  value: number;
}

export type PipelineMetrics = Record<DealStage, StageMetric>;

export interface AgentStatus {
  name: string;
  status: 'active' | 'idle' | 'processing';
  model?: string;
  enabled?: boolean;
}

export interface AgentEventLog {
  id: string;
  timestamp: string;
  agent: string;
  type: string;
  data: Record<string, any>;
}

export interface AgentTriggerResponse {
  status: 'processing' | 'completed';
  message: string;
  details?: Record<string, any>;
}

export interface AnalyticsInsight {
  insights: string[];
  kpis: Array<{
    label: string;
    value: string;
    trend: 'up' | 'down' | 'neutral';
  }>;
  summary: string;
}
