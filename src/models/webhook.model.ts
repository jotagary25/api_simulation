export interface Webhook extends Record<string, unknown> {
  id: string;
  event_type: string;
  payload: Record<string, unknown>;
  processed: boolean;
  processed_at?: Date;
  error_message?: string;
  created_at: Date;
}

export interface CreateWebhookDTO {
  event_type: string;
  payload: Record<string, unknown>;
}

export interface ProcessWebhookDTO {
  processed: boolean;
  processed_at?: Date;
  error_message?: string;
}
