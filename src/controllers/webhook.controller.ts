import { NextFunction, Request, Response } from 'express';
import { AppError } from '../middlewares/error.middleware';
import { CreateWebhookDTO } from '../models/webhook.model';
import webhookService from '../services/webhook.service';
import { ResponseBuilder } from '../types/response.types';
import logger from '../utils/logger';

export class WebhookController {
  async handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // TODO: Verify webhook signature/secret
      // const signature = req.headers['x-webhook-signature'];
      // if (!this.verifySignature(signature, req.body)) {
      //   next(new AppError('Invalid webhook signature', 401));
      //   return;
      // }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const webhookData = req.body as CreateWebhookDTO;
      const webhook = await webhookService.processIncomingWebhook(webhookData);

      res
        .status(200)
        .json(
          ResponseBuilder.success(
            { webhookId: webhook.id },
            'Webhook received and queued for processing'
          )
        );
    } catch (error) {
      logger.error('Controller: Error handling webhook', error);
      next(new AppError('Failed to process webhook', 500));
    }
  }

  async getWebhookById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params['id'];
      if (!id) {
        next(new AppError('Webhook ID is required', 400));
        return;
      }
      const webhook = await webhookService.getWebhookById(id);

      if (!webhook) {
        next(new AppError('Webhook not found', 404));
        return;
      }

      res.status(200).json(ResponseBuilder.success(webhook));
    } catch (error) {
      logger.error('Controller: Error getting webhook', error);
      next(new AppError('Failed to get webhook', 500));
    }
  }

  async getUnprocessedWebhooks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = req.query['limit'] ? parseInt(req.query['limit'] as string, 10) : undefined;
      const webhooks = await webhookService.getUnprocessedWebhooks(limit);

      res.status(200).json(ResponseBuilder.success(webhooks));
    } catch (error) {
      logger.error('Controller: Error getting unprocessed webhooks', error);
      next(new AppError('Failed to get webhooks', 500));
    }
  }

  // private verifySignature(signature: string | undefined, body: unknown): boolean {
  //   // TODO: Implement signature verification
  //   return true;
  // }
}

export default new WebhookController();
