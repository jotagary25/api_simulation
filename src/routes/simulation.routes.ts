import { Router } from 'express';
import simulationController from '../controllers/simulation.controller';
import { schemas, validate } from '../middlewares/validation.middleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

/**
 * @route   POST /api/v1/simulation/:phoneNumberId/messages
 * @desc    Simulate WhatsApp Cloud API Message Endpoint
 * @access  Public (Simulation)
 */
router.post(
  '/:phoneNumberId/messages',
  validate(schemas.whatsappTemplate),
  asyncHandler((req, res, next) => simulationController.sendTemplateMessage(req, res, next))
);

export default router;
