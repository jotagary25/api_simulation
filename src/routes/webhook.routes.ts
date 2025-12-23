import { Router } from 'express';
import webhookController from '../controllers/webhook.controller';
import { schemas, validate } from '../middlewares/validation.middleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

/**
 * @route   POST /api/v1/webhooks
 * @desc    Receive webhook from WhatsApp
 * @access  Public (verified by signature)
 */
router.post(
  '/',
  validate(schemas.webhook),
  asyncHandler((req, res, next) => webhookController.handleWebhook(req, res, next))
);

/**
 * @route   GET /api/v1/webhooks/:id
 * @desc    Get webhook by ID
 * @access  Private
 */
router.get(
  '/:id',
  asyncHandler((req, res, next) => webhookController.getWebhookById(req, res, next))
);

/**
 * @route   GET /api/v1/webhooks/unprocessed
 * @desc    Get unprocessed webhooks
 * @access  Private
 */
router.get(
  '/status/unprocessed',
  asyncHandler((req, res, next) => webhookController.getUnprocessedWebhooks(req, res, next))
);

export default router;
