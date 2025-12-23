import database from '../database';
import { CreateMessageDTO, Message, UpdateMessageDTO } from '../models/message.model';
import logger from '../utils/logger';

export class MessageRepository {
  async create(data: CreateMessageDTO): Promise<Message> {
    const query = `
      INSERT INTO messages (from_number, to_number, message_text, message_type, metadata)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const values = [
      data.from_number,
      data.to_number,
      data.message_text,
      data.message_type || 'text',
      data.metadata ? JSON.stringify(data.metadata) : null,
    ];

    try {
      const result = await database.query<Message>(query, values);
      const message = result.rows[0];

      if (!message) {
        throw new Error('Failed to create message');
      }

      logger.info('Message created', { messageId: message.id });
      return message;
    } catch (error) {
      logger.error('Error creating message', error);
      throw error;
    }
  }

  async findById(id: string): Promise<Message | null> {
    const query = 'SELECT * FROM messages WHERE id = $1';

    try {
      const result = await database.query<Message>(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error finding message by id', { id, error });
      throw error;
    }
  }

  async findAll(limit = 100, offset = 0): Promise<Message[]> {
    const query = `
      SELECT * FROM messages
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;

    try {
      const result = await database.query<Message>(query, [limit, offset]);
      return result.rows;
    } catch (error) {
      logger.error('Error finding all messages', error);
      throw error;
    }
  }

  async update(id: string, data: UpdateMessageDTO): Promise<Message | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (data.status !== undefined) {
      fields.push(`status = $${paramIndex++}`);
      values.push(data.status);
    }

    if (data.whatsapp_message_id !== undefined) {
      fields.push(`whatsapp_message_id = $${paramIndex++}`);
      values.push(data.whatsapp_message_id);
    }

    if (data.metadata !== undefined) {
      fields.push(`metadata = $${paramIndex++}`);
      values.push(JSON.stringify(data.metadata));
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE messages
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    try {
      const result = await database.query<Message>(query, values);
      const message = result.rows[0] || null;

      if (message) {
        logger.info('Message updated', { messageId: id });
      }

      return message;
    } catch (error) {
      logger.error('Error updating message', { id, error });
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM messages WHERE id = $1';

    try {
      const result = await database.query(query, [id]);
      const deleted = (result.rowCount ?? 0) > 0;

      if (deleted) {
        logger.info('Message deleted', { messageId: id });
      }

      return deleted;
    } catch (error) {
      logger.error('Error deleting message', { id, error });
      throw error;
    }
  }

  async findByPhoneNumber(phoneNumber: string, limit = 50): Promise<Message[]> {
    const query = `
      SELECT * FROM messages
      WHERE from_number = $1 OR to_number = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;

    try {
      const result = await database.query<Message>(query, [phoneNumber, limit]);
      return result.rows;
    } catch (error) {
      logger.error('Error finding messages by phone number', { phoneNumber, error });
      throw error;
    }
  }
}

export default new MessageRepository();
