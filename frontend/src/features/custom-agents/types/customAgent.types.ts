/**
 * TypeScript definitions for Custom Agent Builder & Studio
 */

export type TriggerType = 'manual' | 'event' | 'webhook' | 'schedule';

export interface CRMToolCapability {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  parameters: string[];
}

export interface CustomAgent {
  id: string;
  name: string;
  description?: string | null;
  icon: string;
  trigger_type: TriggerType;
  trigger_config?: Record<string, any>;
  model_provider?: string;
  model_name?: string;
  temperature: number;
  system_prompt: string;
  tools_enabled: string[];
  is_active: boolean;
  execution_count: number;
  last_run_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CustomAgentCreate {
  name: string;
  description?: string;
  icon?: string;
  trigger_type: TriggerType;
  trigger_config?: Record<string, any>;
  model_provider?: string;
  model_name?: string;
  temperature: number;
  system_prompt: string;
  tools_enabled: string[];
  is_active: boolean;
}

export interface CustomAgentUpdate {
  name?: string;
  description?: string;
  icon?: string;
  trigger_type?: TriggerType;
  trigger_config?: Record<string, any>;
  model_provider?: string;
  model_name?: string;
  temperature?: number;
  system_prompt?: string;
  tools_enabled?: string[];
  is_active?: boolean;
}

export interface ThoughtStep {
  step: string;
  timestamp: string;
  content: string;
  rendered_prompt_preview?: string;
}

export interface ToolCallExecution {
  tool: string;
  timestamp: string;
  input: Record<string, any>;
  result: Record<string, any>;
}

export interface CustomAgentExecution {
  id: string;
  agent_id: string;
  status: 'success' | 'failed' | 'running';
  trigger_event: string;
  input_payload: Record<string, any>;
  output_payload: Record<string, any>;
  thought_trace: ThoughtStep[];
  tool_calls: ToolCallExecution[];
  duration_ms: number;
  tokens_used: number;
  created_at: string;
}

export interface ExecutionResult {
  status: string;
  agent_id: string;
  agent_name: string;
  execution_id?: string;
  duration_ms: number;
  tokens_used: number;
  response: string;
  thought_trace: ThoughtStep[];
  tool_calls: ToolCallExecution[];
  output: Record<string, any>;
}
