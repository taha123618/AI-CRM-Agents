export interface SequenceStep {
  step_number: number;
  channel: 'email' | 'whatsapp' | 'voice' | 'linkedin';
  delay_days: number;
  subject: string;
  template: string;
}

export interface SDRSequence {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'draft';
  channel: string;
  target_persona: string;
  enrolled_count: number;
  replied_count: number;
  conversion_rate_pct: number;
  steps: SequenceStep[];
  created_at: string;
}

export interface CreateSequencePayload {
  name: string;
  channel: string;
  target_persona: string;
  steps: SequenceStep[];
}

export interface GenerateStepCopyPayload {
  contact_id?: string;
  step_number: number;
  channel: string;
  prospect_pain_point?: string;
}

export interface GeneratedStepCopyResponse {
  sequence_id: string;
  contact_name: string;
  company_name: string;
  channel: string;
  step_number: number;
  ai_generated_copy: string;
}
