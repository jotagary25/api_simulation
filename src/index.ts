import App from './app';
import config from './config';
import logger from './utils/logger';

const app = new App();

// Graceful shutdown
const gracefulShutdown = async (signal: string): Promise<void> => {
  logger.info(`${signal} signal received: closing HTTP server`);
  await app.stop();
  process.exit(0);
};

// Handle shutdown signals
process.on('SIGTERM', () => void gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => void gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: unknown) => {
  logger.error('Unhandled Rejection', reason);
  process.exit(1);
});

// Start application
app.start().catch((error) => {
  logger.error('Failed to start application', error);
  process.exit(1);
});

logger.info('Application initializing', {
  environment: config.app.env,
  nodeVersion: process.version,
});
