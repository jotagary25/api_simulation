import { Router } from 'express';
import messageController from '../controllers/message.controller';
import { schemas, validate } from '../middlewares/validation.middleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

/**
 * @route   POST /api/v1/messages
 * @desc    Create a new message
 * @access  Public (should be protected in production)
 */
router.post(
  '/',
  validate(schemas.createMessage),
  asyncHandler((req, res, next) => messageController.createMessage(req, res, next))
);

/**
 * @route   GET /api/v1/messages
 * @desc    Get all messages with pagination
 * @access  Public (should be protected in production)
 */
router.get(
  '/',
  validate(schemas.pagination),
  asyncHandler((req, res, next) => messageController.getAllMessages(req, res, next))
);

/**
 * @route   GET /api/v1/messages/:id
 * @desc    Get message by ID
 * @access  Public (should be protected in production)
 */
router.get(
  '/:id',
  validate(schemas.getMessage),
  asyncHandler((req, res, next) => messageController.getMessageById(req, res, next))
);

/**
 * @route   PATCH /api/v1/messages/:id
 * @desc    Update message
 * @access  Public (should be protected in production)
 */
router.patch(
  '/:id',
  validate(schemas.updateMessage),
  asyncHandler((req, res, next) => messageController.updateMessage(req, res, next))
);

/**
 * @route   DELETE /api/v1/messages/:id
 * @desc    Delete message
 * @access  Public (should be protected in production)
 */
router.delete(
  '/:id',
  validate(schemas.getMessage),
  asyncHandler((req, res, next) => messageController.deleteMessage(req, res, next))
);

/**
 * @route   GET /api/v1/messages/phone/:phoneNumber
 * @desc    Get messages by phone number
 * @access  Public (should be protected in production)
 */
router.get(
  '/phone/:phoneNumber',
  asyncHandler((req, res, next) => messageController.getMessagesByPhoneNumber(req, res, next))
);

export default router;
