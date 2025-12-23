import { CreateMessageDTO, Message, UpdateMessageDTO } from '../models/message.model';
import messageRepository from '../repositories/message.repository';
import logger from '../utils/logger';

export class MessageService {
  async createMessage(data: CreateMessageDTO): Promise<Message> {
    // Validate phone numbers (basic validation)
    if (!this.isValidPhoneNumber(data.from_number) || !this.isValidPhoneNumber(data.to_number)) {
      throw new Error('Invalid phone number format');
    }

    try {
      const message = await messageRepository.create(data);

      // Here you would integrate with actual WhatsApp API
      // await this.sendToWhatsApp(message);

      logger.info('Message service: Message created and queued', { messageId: message.id });
      return message;
    } catch (error) {
      logger.error('Message service: Error creating message', error);
      throw error;
    }
  }

  async getMessageById(id: string): Promise<Message | null> {
    try {
      return await messageRepository.findById(id);
    } catch (error) {
      logger.error('Message service: Error getting message', { id, error });
      throw error;
    }
  }

  async getAllMessages(limit?: number, offset?: number): Promise<Message[]> {
    try {
      return await messageRepository.findAll(limit, offset);
    } catch (error) {
      logger.error('Message service: Error getting all messages', error);
      throw error;
    }
  }

  async updateMessage(id: string, data: UpdateMessageDTO): Promise<Message | null> {
    try {
      const message = await messageRepository.update(id, data);

      if (!message) {
        logger.warn('Message service: Message not found for update', { id });
      }

      return message;
    } catch (error) {
      logger.error('Message service: Error updating message', { id, error });
      throw error;
    }
  }

  async deleteMessage(id: string): Promise<boolean> {
    try {
      return await messageRepository.delete(id);
    } catch (error) {
      logger.error('Message service: Error deleting message', { id, error });
      throw error;
    }
  }

  async getMessagesByPhoneNumber(phoneNumber: string, limit?: number): Promise<Message[]> {
    try {
      return await messageRepository.findByPhoneNumber(phoneNumber, limit);
    } catch (error) {
      logger.error('Message service: Error getting messages by phone', { phoneNumber, error });
      throw error;
    }
  }

  private isValidPhoneNumber(phoneNumber: string): boolean {
    // Basic validation - adjust according to your needs
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber);
  }

  // private async sendToWhatsApp(message: Message): Promise<void> {
  //   // TODO: Implement WhatsApp API integration
  //   logger.info('Sending message to WhatsApp API', { messageId: message.id });
  // }
}

export default new MessageService();
