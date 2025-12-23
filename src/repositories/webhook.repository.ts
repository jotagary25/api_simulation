import database from '../database';
import { CreateWebhookDTO, ProcessWebhookDTO, Webhook } from '../models/webhook.model';
import logger from '../utils/logger';

export class WebhookRepository {
  async create(data: CreateWebhookDTO): Promise<Webhook> {
    const query = `
      INSERT INTO webhooks (event_type, payload)
      VALUES ($1, $2)
      RETURNING *
    `;

    const values = [data.event_type, JSON.stringify(data.payload)];

    try {
      const result = await database.query<Webhook>(query, values);
      const webhook = result.rows[0];

      if (!webhook) {
        throw new Error('Failed to create webhook');
      }

      logger.info('Webhook created', { webhookId: webhook.id, eventType: data.event_type });
      return webhook;
    } catch (error) {
      logger.error('Error creating webhook', error);
      throw error;
    }
  }

  async findById(id: string): Promise<Webhook | null> {
    const query = 'SELECT * FROM webhooks WHERE id = $1';

    try {
      const result = await database.query<Webhook>(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error finding webhook by id', { id, error });
      throw error;
    }
  }

  async findUnprocessed(limit = 100): Promise<Webhook[]> {
    const query = `
      SELECT * FROM webhooks
      WHERE processed = FALSE
      ORDER BY created_at ASC
      LIMIT $1
    `;

    try {
      const result = await database.query<Webhook>(query, [limit]);
      return result.rows;
    } catch (error) {
      logger.error('Error finding unprocessed webhooks', error);
      throw error;
    }
  }

  async markAsProcessed(id: string, data: ProcessWebhookDTO): Promise<Webhook | null> {
    const query = `
      UPDATE webhooks
      SET processed = $1, processed_at = $2, error_message = $3
      WHERE id = $4
      RETURNING *
    `;

    const values = [
      data.processed,
      data.processed_at || new Date(),
      data.error_message || null,
      id,
    ];

    try {
      const result = await database.query<Webhook>(query, values);
      const webhook = result.rows[0] || null;

      if (webhook) {
        logger.info('Webhook marked as processed', { webhookId: id });
      }

      return webhook;
    } catch (error) {
      logger.error('Error marking webhook as processed', { id, error });
      throw error;
    }
  }

  async findByEventType(eventType: string, limit = 100): Promise<Webhook[]> {
    const query = `
      SELECT * FROM webhooks
      WHERE event_type = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;

    try {
      const result = await database.query<Webhook>(query, [eventType, limit]);
      return result.rows;
    } catch (error) {
      logger.error('Error finding webhooks by event type', { eventType, error });
      throw error;
    }
  }
}

export default new WebhookRepository();
