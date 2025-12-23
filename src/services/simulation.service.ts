import { createHmac, randomBytes } from 'crypto';
import config from '../config';
import messageRepository from '../repositories/message.repository';
import {
  StatusObject,
  TemplateMessagePayload,
  WebhookStatusPayload,
  WhatsAppSuccessResponse,
} from '../types/whatsapp.types';
import logger from '../utils/logger';

export class SimulationService {
  /**
   * Simulates sending a WhatsApp Template Message
   * Returns a standard WhatsApp Graph API response
   * And triggers asynchronous status updates (webhooks)
   */
  async sendTemplateMessage(
    phoneNumberId: string,
    payload: TemplateMessagePayload
  ): Promise<WhatsAppSuccessResponse> {
    const start = Date.now();

    // 1. Generate a realistic WhatsApp Message ID (wamid)
    const randomPart = randomBytes(16).toString('hex').toUpperCase();
    const wamid = `wamid.HBgL${randomPart}`;

    // 2. Persist the message (initially as pending pattern)
    try {
      const message = await messageRepository.create({
        from_number: phoneNumberId,
        to_number: payload.to,
        message_text: `Template: ${payload.template.name} (${payload.template.language.code})`,
        message_type: 'template',
        metadata: {
          simulated: true,
          messaging_product: payload.messaging_product,
          recipient_type: payload.recipient_type,
          template: payload.template,
          simulated_at: new Date(),
        },
      });

      // 3. Immediately update with simulation details
      await messageRepository.update(message.id, {
        status: 'sent',
        whatsapp_message_id: wamid,
      });

      // 4. Trigger Async Lifecycle (Sent -> Delivered -> Read)
      // We do NOT await this, it runs in the background
      void this.triggerMessageLifecycle(phoneNumberId, wamid, payload.to);
    } catch (error) {
      logger.error('Simulation Service: Failed to persist simulated message', error);
    }

    const duration = Date.now() - start;
    logger.info('Simulated WhatsApp API response generated', {
      wamid,
      to: payload.to,
      template: payload.template.name,
      duration,
    });

    return {
      messaging_product: 'whatsapp',
      contacts: [
        {
          input: payload.to,
          wa_id: payload.to,
        },
      ],
      messages: [
        {
          id: wamid,
        },
      ],
    };
  }

  /**
   * Orchestrates the timing of status updates
   */
  private triggerMessageLifecycle(phoneNumberId: string, wamid: string, recipientId: string): void {
    const targetUrl = config.simulation.clientWebhookUrl;
    if (!targetUrl) {
      logger.warn('Simulation: No CLIENT_WEBHOOK_URL configured. Skipping webhooks.');
      return;
    }

    // Delays (in ms)
    const sentDelay = 500; // 0.5s
    const deliveredDelay = sentDelay + this.randomDelay(1000, 3000); // + 1-3s
    const readDelay = deliveredDelay + this.randomDelay(2000, 5000); // + 2-5s

    // Schedule 'sent'
    setTimeout(() => {
      void this.sendStatusUpdate(phoneNumberId, wamid, recipientId, 'sent');
    }, sentDelay);

    // Schedule 'delivered'
    setTimeout(() => {
      void this.sendStatusUpdate(phoneNumberId, wamid, recipientId, 'delivered');
    }, deliveredDelay);

    // Schedule 'read'
    setTimeout(() => {
      void this.sendStatusUpdate(phoneNumberId, wamid, recipientId, 'read');
    }, readDelay);
  }

  /**
   * Generates and sends a webhook for a specific status
   */
  private async sendStatusUpdate(
    phoneNumberId: string,
    wamid: string,
    recipientId: string,
    status: 'sent' | 'delivered' | 'read'
  ): Promise<void> {
    const timestamp = Math.floor(Date.now() / 1000).toString();

    // Construct the Onion Payload
    const statusObj: StatusObject = {
      id: wamid,
      status: status,
      timestamp: timestamp,
      recipient_id: recipientId,
      conversation: {
        id: `CON_${wamid.substring(10, 20)}`, // Fake conversation ID
        origin: {
          type: 'marketing', // Templates usually start marketing conversations
        },
      },
      pricing:
        status !== 'read' // Pricing info is usually in sent/delivered
          ? {
              billable: true,
              pricing_model: 'CBP',
              category: 'marketing',
            }
          : undefined,
    };

    const payload: WebhookStatusPayload = {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: '100000000000000', // Fake WABA ID
          changes: [
            {
              value: {
                messaging_product: 'whatsapp',
                metadata: {
                  display_phone_number: '1555000000', // Fake display number
                  phone_number_id: phoneNumberId,
                },
                statuses: [statusObj],
              },
              field: 'messages',
            },
          ],
        },
      ],
    };

    await this.sendWebhook(payload);
  }

  /**
   * Sends the HTTP POST with SHA256 Signature
   */
  private async sendWebhook(payload: WebhookStatusPayload): Promise<void> {
    const url = config.simulation.clientWebhookUrl;
    const secret = config.simulation.appSecret;
    const body = JSON.stringify(payload);

    // Generate X-Hub-Signature-256
    const signature = createHmac('sha256', secret).update(body).digest('hex');

    try {
      logger.info(
        `Simulation: Sending '${payload.entry[0]?.changes[0]?.value.statuses?.[0]?.status}' webhook`,
        {
          url,
        }
      );

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'WhatsApp/FakeSimulator',
          'X-Hub-Signature-256': `sha256=${signature}`,
        },
        body: body,
      });

      if (!response.ok) {
        logger.warn('Simulation: Webhook delivery failed', {
          status: response.status,
          statusText: response.statusText,
        });
      } else {
        logger.debug('Simulation: Webhook delivered successfully');
      }
    } catch (error) {
      logger.error('Simulation: Webhook network error', error);
    }
  }

  private randomDelay(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
}

export default new SimulationService();
