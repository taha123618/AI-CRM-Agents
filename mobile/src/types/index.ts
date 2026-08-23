/**
 * Domain TypeScript Definitions for Field Sales Mobile App
 */

export type UserRole = 'admin' | 'sales' | 'support' | 'auditor';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
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
}

export interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  company?: string | null;
  score: number;
  status: 'new' | 'contacted' | 'qualified' | 'lost';
  phone?: string | null;
  ai_summary?: string | null;
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
  last_triggered_at?: string | null;
  execution_count?: number;
  conditions?: Record<string, any>;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'lead_alert' | 'deal_risk' | 'task_reminder' | 'workflow_event' | 'system';
  severity: 'info' | 'warning' | 'critical' | 'success';
  timestamp: string;
  is_read: boolean;
  entity_type?: 'deal' | 'lead' | 'contact' | 'workflow';
  entity_id?: string;
}

export interface OfflineAction {
  id: string;
  action_type: 'create_voice_note' | 'update_deal' | 'update_custom_fields' | 'create_task';
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  payload: any;
  created_at: string;
  retry_count: number;
}
