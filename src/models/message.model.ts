export interface Message extends Record<string, unknown> {
  id: string;
  from_number: string;
  to_number: string;
  message_text: string;
  message_type: string;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  whatsapp_message_id?: string;
  metadata?: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

export interface CreateMessageDTO {
  from_number: string;
  to_number: string;
  message_text: string;
  message_type?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateMessageDTO {
  status?: Message['status'];
  whatsapp_message_id?: string;
  metadata?: Record<string, unknown>;
}
