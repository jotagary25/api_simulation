import { CreateWebhookDTO, Webhook } from '../models/webhook.model';
import webhookRepository from '../repositories/webhook.repository';
import logger from '../utils/logger';

export class WebhookService {
  async processIncomingWebhook(data: CreateWebhookDTO): Promise<Webhook> {
    try {
      // Store webhook in database
      const webhook = await webhookRepository.create(data);

      // Process webhook asynchronously
      this.processWebhookAsync(webhook.id, data).catch((error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error('Error in async webhook processing', {
          webhookId: webhook.id,
          error: errorMessage,
        });
      });

      return webhook;
    } catch (error) {
      logger.error('Webhook service: Error processing incoming webhook', error);
      throw error;
    }
  }

  async getWebhookById(id: string): Promise<Webhook | null> {
    try {
      return await webhookRepository.findById(id);
    } catch (error) {
      logger.error('Webhook service: Error getting webhook', { id, error });
      throw error;
    }
  }

  async getUnprocessedWebhooks(limit?: number): Promise<Webhook[]> {
    try {
      return await webhookRepository.findUnprocessed(limit);
    } catch (error) {
      logger.error('Webhook service: Error getting unprocessed webhooks', error);
      throw error;
    }
  }

  private async processWebhookAsync(webhookId: string, data: CreateWebhookDTO): Promise<void> {
    try {
      logger.info('Processing webhook', { webhookId, eventType: data.event_type });

      // TODO: Implement webhook processing logic based on event_type
      // Example:
      // switch (data.event_type) {
      //   case 'message.received':
      //     await this.handleMessageReceived(data.payload);
      //     break;
      //   case 'message.status':
      //     await this.handleMessageStatus(data.payload);
      //     break;
      //   default:
      //     logger.warn('Unknown webhook event type', { eventType: data.event_type });
      // }

      // Mark webhook as processed
      await webhookRepository.markAsProcessed(webhookId, {
        processed: true,
        processed_at: new Date(),
      });

      logger.info('Webhook processed successfully', { webhookId });
    } catch (error) {
      logger.error('Error processing webhook', { webhookId, error });

      // Mark webhook as processed with error
      await webhookRepository.markAsProcessed(webhookId, {
        processed: true,
        processed_at: new Date(),
        error_message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async reprocessFailedWebhooks(): Promise<void> {
    try {
      const failedWebhooks = await webhookRepository.findUnprocessed();

      logger.info('Reprocessing failed webhooks', { count: failedWebhooks.length });

      for (const webhook of failedWebhooks) {
        await this.processWebhookAsync(webhook.id, {
          event_type: webhook.event_type,
          payload: webhook.payload,
        });
      }
    } catch (error) {
      logger.error('Error reprocessing failed webhooks', error);
      throw error;
    }
  }
}

export default new WebhookService();
