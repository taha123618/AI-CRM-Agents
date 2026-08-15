export interface VoiceCallTranscript {
  id: string;
  speaker: 'rep' | 'prospect' | 'ai_assistant';
  text: string;
  timestamp_seconds: number;
  sentiment?: 'positive' | 'neutral' | 'negative';
  coaching_tip?: string | null;
}

export interface VoiceCall {
  id: string;
  contact_name: string;
  phone_number: string;
  direction: 'outbound' | 'inbound';
  status: 'queued' | 'in-progress' | 'completed' | 'missed';
  duration_seconds: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  buyer_intent_score: number;
  summary?: string | null;
  recording_url?: string | null;
  action_items: string[];
  objections_handled: string[];
  transcripts?: VoiceCallTranscript[];
  created_at?: string;
}

export interface VoiceTurnAnalysis {
  speaker: string;
  text: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  objection_detected?: string | null;
  coaching_tip?: string | null;
  timestamp: string;
}

export interface VoiceCallStats {
  total_calls: number;
  avg_buyer_intent_score: number;
  avg_duration_seconds: number;
  sentiment_distribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  direction_split: {
    inbound: number;
    outbound: number;
  };
  top_objections: Array<{ objection: string; count: number }>;
  calls_this_week: number;
}
