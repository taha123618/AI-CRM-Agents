export interface WhatsAppMessage {
  id: string;
  conversation_id: string;
  sender_type: 'prospect' | 'agent' | 'bot';
  text: string;
  media_url?: string | null;
  media_type?: string | null;
  status: 'sent' | 'delivered' | 'read';
  intent?: string | null;
  created_at: string;
}

export interface WhatsAppConversation {
  id: string;
  contact_name: string;
  phone_number: string;
  status: 'active' | 'archived' | 'handed_off';
  unread_count: number;
  ai_auto_pilot: boolean;
  tags: string[];
  last_message_at?: string | null;
  created_at?: string;
}

export interface WhatsAppStats {
  total_conversations: number;
  active_conversations: number;
  auto_pilot_enabled: number;
  handed_off_conversations: number;
  total_messages: number;
  bot_auto_reply_rate: number;
  avg_response_time_seconds: number;
  unread_total: number;
}

export interface BroadcastPayload {
  phone_numbers: string[];
  template_text: string;
  contact_name_override?: string;
}
