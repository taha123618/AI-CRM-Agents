/**
 * Complete Domain TypeScript Definitions for Field Sales Mobile App & AI-CRM Agents
 */

export type UserRole = 'admin' | 'sales' | 'support' | 'auditor';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  avatar_url?: string | null;
  last_login?: string | null;
  created_at?: string;
}

export type DealStage =
  | 'discovery'
  | 'qualification'
  | 'proposal'
  | 'negotiation'
  | 'closed_won'
  | 'closed_lost';

export interface Deal {
  id: string;
  name: string;
  value: number;
  stage: DealStage;
  health_score: number;       // 0 - 100
  is_stalled: boolean;
  risk_factors?: string[] | null;
  close_probability?: number | null;
  next_actions?: string[] | null;
  forecast_close_date?: string | null;
  contact_id?: string | null;
  contact_name?: string | null;
  company_name?: string | null;
  days_in_stage?: number;
  last_activity_date?: string;
  custom_fields?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface DealCreateInput {
  name: string;
  value: number;
  stage: DealStage;
  contact_name?: string;
  company_name?: string;
  forecast_close_date?: string;
  custom_fields?: Record<string, any>;
}

export interface DealUpdateInput {
  name?: string;
  value?: number;
  stage?: DealStage;
  health_score?: number;
  is_stalled?: boolean;
  contact_name?: string;
  company_name?: string;
  forecast_close_date?: string;
  custom_fields?: Record<string, any>;
}

export interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  company_name?: string | null;
  job_title?: string | null;
  lead_source?: string | null;
  lead_score: number;
  lead_status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  phone?: string | null;
  buying_signals?: string[] | null;
  recommended_action?: string | null;
  routing_team?: string | null;
  created_at?: string;
}

export interface LeadCreateInput {
  first_name: string;
  last_name: string;
  email: string;
  company_name?: string;
  job_title?: string;
  lead_source?: string;
  phone?: string;
}

export interface Customer {
  id: string;
  name?: string;
  company_name?: string;
  plan?: string;
  mrr?: number;
  arr?: number;
  health_score?: number;
  churn_risk?: 'low' | 'medium' | 'high';
  churn_probability?: number;
  logins_per_week?: number;
  features_used?: number;
  license_usage_percent?: number;
  recommended_actions?: string[];
  renewal_date?: string;
  created_at?: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  role?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  deal_id?: string;
  created_at?: string;
}

export interface VoiceNote {
  id: string;
  title: string;
  duration_seconds: number;
  audio_uri?: string;
  transcript: string;
  summary: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  buyer_intent_score: number;
  action_items: string[];
  entity_type: 'deal' | 'contact' | 'customer' | 'general';
  entity_id?: string;
  entity_name?: string;
  created_at: string;
  is_synced: boolean;
}

export type CustomFieldType =
  | 'text'
  | 'number'
  | 'select'
  | 'boolean'
  | 'date'
  | 'currency';

export interface CustomFieldDefinition {
  id: string;
  entity_type: 'contact' | 'deal' | 'customer' | 'company';
  name: string;
  field_key: string;
  field_type: CustomFieldType;
  options?: string[];
  is_required: boolean;
  default_value?: any;
}

export interface WorkflowTrigger {
  id: string;
  name: string;
  trigger_event: string;
  action_agent: string;
  action_type: string;
  is_active: boolean;
  last_triggered_at?: string;
  execution_count?: number;
  conditions?: Record<string, any>;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'lead_alert' | 'deal_risk' | 'workflow_event' | 'system_alert';
  severity: 'info' | 'warning' | 'critical' | 'success';
  timestamp: string;
  is_read: boolean;
  entity_type?: string;
  entity_id?: string;
}

export interface OfflineAction {
  id: string;
  action_type: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  payload?: any;
  created_at: string;
  retry_count: number;
}

export interface MonteCarloResult {
  p10: number;
  p50: number;
  p90: number;
  iterations: number;
  historical_variance?: number;
  confidence_interval?: [number, number];
}

export interface SequenceStep {
  step_number: number;
  channel: 'email' | 'whatsapp' | 'call';
  delay_days: number;
  template_title: string;
  prompt_blueprint?: string;
}

export interface Sequence {
  id: string;
  name: string;
  target_persona: string;
  is_active: boolean;
  enrolled_leads_count: number;
  steps: SequenceStep[];
}

export interface WarRoomVerdict {
  deal_id: string;
  consensus_recommendation: string;
  win_probability: number;
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  competitor_battle_cards?: {
    competitor: string;
    our_advantage: string;
    their_weakness: string;
  }[];
}

export interface AuditLogEntry {
  id: string;
  action: string;
  user_email: string;
  resource_type: string;
  resource_id?: string;
  ip_address?: string;
  timestamp: string;
}
