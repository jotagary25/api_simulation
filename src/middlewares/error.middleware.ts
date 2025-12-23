import logger from '../utils/logger';
import { NextFunction, Request, Response } from 'express';

export interface ApiError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const isOperational = err.isOperational ?? false;

  // Log error
  logger.error('Error occurred', {
    statusCode,
    message,
    isOperational,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env['NODE_ENV'] === 'development' && {
      stack: err.stack,
      error: err,
    }),
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  logger.warn('Route not found', { path: req.path, method: req.method });

  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
  });
};

export class AppError extends Error implements ApiError {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}
