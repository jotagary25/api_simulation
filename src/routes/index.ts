import { Router } from 'express';
import messageRoutes from './message.routes';
import webhookRoutes from './webhook.routes';

const router = Router();

// API Routes
router.use('/messages', messageRoutes);
router.use('/webhooks', webhookRoutes);

export default router;
