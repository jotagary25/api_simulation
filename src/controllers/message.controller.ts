import { NextFunction, Request, Response } from 'express';
import { AppError } from '../middlewares/error.middleware';
import { CreateMessageDTO, UpdateMessageDTO } from '../models/message.model';
import messageService from '../services/message.service';
import { ResponseBuilder } from '../types/response.types';
import logger from '../utils/logger';

export class MessageController {
  async createMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const messageData = req.body as CreateMessageDTO;
      const message = await messageService.createMessage(messageData);
      res.status(201).json(ResponseBuilder.success(message, 'Message created successfully'));
    } catch (error) {
      logger.error('Controller: Error creating message', error);
      next(new AppError('Failed to create message', 500));
    }
  }

  async getMessageById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params['id'];
      if (!id) {
        next(new AppError('Message ID is required', 400));
        return;
      }
      const message = await messageService.getMessageById(id);

      if (!message) {
        next(new AppError('Message not found', 404));
        return;
      }

      res.status(200).json(ResponseBuilder.success(message));
    } catch (error) {
      logger.error('Controller: Error getting message', error);
      next(new AppError('Failed to get message', 500));
    }
  }

  async getAllMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = req.query['limit'] ? parseInt(req.query['limit'] as string, 10) : undefined;
      const offset = req.query['offset'] ? parseInt(req.query['offset'] as string, 10) : undefined;

      const messages = await messageService.getAllMessages(limit, offset);

      // Mocking total count for now as repository method needs update to return { data, total }
      const total = messages.length + (offset || 0);
      res
        .status(200)
        .json(ResponseBuilder.paginated(messages, total, limit || messages.length, offset || 0));
    } catch (error) {
      logger.error('Controller: Error getting all messages', error);
      next(new AppError('Failed to get messages', 500));
    }
  }

  async updateMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params['id'];
      if (!id) {
        next(new AppError('Message ID is required', 400));
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const updateData = req.body as UpdateMessageDTO;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const message = await messageService.updateMessage(id, updateData);

      if (!message) {
        next(new AppError('Message not found', 404));
        return;
      }

      res.status(200).json(ResponseBuilder.success(message, 'Message updated successfully'));
    } catch (error) {
      logger.error('Controller: Error updating message', error);
      next(new AppError('Failed to update message', 500));
    }
  }

  async deleteMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params['id'];
      if (!id) {
        next(new AppError('Message ID is required', 400));
        return;
      }
      const deleted = await messageService.deleteMessage(id);

      if (!deleted) {
        next(new AppError('Message not found', 404));
        return;
      }

      res.status(200).json(ResponseBuilder.success(null, 'Message deleted successfully'));
    } catch (error) {
      logger.error('Controller: Error deleting message', error);
      next(new AppError('Failed to delete message', 500));
    }
  }

  async getMessagesByPhoneNumber(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const phoneNumber = req.params['phoneNumber'];
      if (!phoneNumber) {
        next(new AppError('Phone number is required', 400));
        return;
      }
      const limit = req.query['limit'] ? parseInt(req.query['limit'] as string, 10) : undefined;

      const messages = await messageService.getMessagesByPhoneNumber(phoneNumber, limit);

      res.status(200).json(ResponseBuilder.success(messages));
    } catch (error) {
      logger.error('Controller: Error getting messages by phone number', error);
      next(new AppError('Failed to get messages', 500));
    }
  }
}

export default new MessageController();
