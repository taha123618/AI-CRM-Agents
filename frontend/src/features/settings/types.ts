export interface SystemUser {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'sales' | 'support' | 'auditor';
  is_active: boolean;
  is_verified?: boolean;
  permissions?: string[];
  last_login_at?: string;
  created_at: string;
}

export interface WebhookEndpoint {
  id: string;
  url: string;
  description?: string;
  secret: string;
  events: string[];
  is_active: boolean;
  created_at: string;
}

export interface WebhookDelivery {
  id: string;
  webhook_id: string;
  event_type: string;
  payload: Record<string, unknown>;
  response_status?: number;
  response_body?: string;
  success: boolean;
  created_at: string;
}

export interface BackgroundTask {
  task_id: string;
  task_type?: string;
  task_name?: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  result?: Record<string, unknown>;
  error?: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  updated_at?: string;
}

export interface AuditLogEntry {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  actor: string;
  details: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  plan_tier: 'starter' | 'growth' | 'enterprise';
  is_active: boolean;
  created_at?: string;
}

export interface SemanticSearchResult {
  id: string;
  entity_type: 'voice_call' | 'meeting' | 'email' | 'deal' | string;
  title: string;
  similarity_score: number;
  snippet: string;
  metadata?: Record<string, unknown>;
}

export interface RagCitation {
  source_index: number;
  entity_type: string;
  id: string;
  title: string;
  similarity_score: number;
}

export interface RagAnswerResponse {
  question: string;
  answer: string;
  sources: RagCitation[];
  confidence: number;
}

export interface CustomFieldDefinition {
  id: string;
  entity_type: 'contact' | 'deal' | 'customer' | 'company' | string;
  name: string;
  field_key: string;
  field_type: 'text' | 'number' | 'select' | 'boolean' | 'date' | 'currency';
  options: string[];
  is_required: boolean;
  default_value?: any;
  created_at?: string;
}

export interface LLMEvaluationRun {
  id: string;
  agent_name: string;
  winner: string;
  score_a: number;
  score_b: number;
  latency_ms_a: number;
  latency_ms_b: number;
  tokens_used_a: number;
  tokens_used_b: number;
  dataset_size?: number;
  created_at?: string;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  trigger_type: string;
  trigger_config: Record<string, unknown>;
  nodes: Array<{
    id: string;
    type: 'trigger' | 'agent' | 'action' | string;
    label: string;
    agent?: string;
    position?: { x: number; y: number };
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
  }>;
  is_active: boolean;
  execution_count: number;
  last_executed_at?: string;
  created_at?: string;
}
