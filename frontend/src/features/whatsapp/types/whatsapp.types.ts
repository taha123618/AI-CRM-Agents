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
