export interface SystemUser {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'sales' | 'support' | 'auditor';
  is_active: boolean;
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
