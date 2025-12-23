/**
 * WhatsApp Cloud API Types
 * Based on Graph API v21.0 Documentation
 */

export type ProductType = 'whatsapp';
export type RecipientType = 'individual';
export type MessageType =
  | 'template'
  | 'text'
  | 'image'
  | 'audio'
  | 'video'
  | 'document'
  | 'sticker'
  | 'location'
  | 'contacts'
  | 'interactive';

export interface Language {
  code: string; // e.g., 'en_US', 'es_MX'
}

// --- Parameters Types ---

export interface TextParameter {
  type: 'text';
  text: string;
}

export interface Currency {
  fallback_value: string;
  code: string;
  amount_1000: number;
}

export interface CurrencyParameter {
  type: 'currency';
  currency: Currency;
}

export interface DateTime {
  fallback_value: string;
}

export interface DateTimeParameter {
  type: 'date_time';
  date_time: DateTime;
}

export interface MediaParameter {
  type: 'image' | 'video' | 'document';
  image?: { link?: string; id?: string };
  video?: { link?: string; id?: string };
  document?: { link?: string; id?: string; filename?: string };
}

export interface PayloadParameter {
  type: 'payload';
  payload: string;
}

export type ComponentParameter =
  | TextParameter
  | CurrencyParameter
  | DateTimeParameter
  | MediaParameter
  | PayloadParameter;

// --- Components ---

export type ComponentType = 'body' | 'header' | 'button' | 'footer';
export type ButtonSubType = 'quick_reply' | 'url' | 'catalog';

export interface TemplateComponent {
  type: ComponentType;
  sub_type?: ButtonSubType; // Required for 'button' type
  index?: string; // Required for 'button' type (0-indexed position)
  parameters: ComponentParameter[];
}

// --- Main Template Structure ---

export interface TemplateObject {
  name: string;
  language: Language;
  components?: TemplateComponent[];
}

export interface TemplateMessagePayload {
  messaging_product: ProductType;
  recipient_type?: RecipientType;
  to: string;
  type: 'template';
  template: TemplateObject;
}

// --- API Responses ---

export interface WhatsAppSuccessResponse {
  messaging_product: 'whatsapp';
  contacts: {
    input: string;
    wa_id: string;
  }[];
  messages: {
    id: string;
  }[];
}

// --- Status Update Types (Webhooks) ---

export interface StatusObject {
  id: string; // wamid
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string; // Unix timestamp string
  recipient_id: string;
  conversation?: {
    id: string;
    origin: {
      type: string;
    };
  };
  pricing?: {
    billable: boolean;
    pricing_model: string;
    category: string;
  };
  errors?: {
    code: number;
    title: string;
    message: string;
    error_data: {
      details: string;
    };
  }[];
}

export interface WebhookChangeValue {
  messaging_product: 'whatsapp';
  metadata: {
    display_phone_number: string;
    phone_number_id: string;
  };
  statuses?: StatusObject[];
  messages?: unknown[]; // Inbound messages
  contacts?: unknown[];
}

export interface WebhookEntry {
  id: string; // WhatsApp Business Account ID
  changes: {
    value: WebhookChangeValue;
    field: 'messages';
  }[];
}

export interface WebhookStatusPayload {
  object: 'whatsapp_business_account';
  entry: WebhookEntry[];
}
