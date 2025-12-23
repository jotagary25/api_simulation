import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import logger from '../utils/logger';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */

export interface ValidationSchema {
  body?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
}

export const validate = (schema: ValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const validationOptions = {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true,
    };

    const errors: string[] = [];

    // Validate request body
    if (schema.body) {
      const { error, value } = schema.body.validate(req.body, validationOptions);
      if (error) {
        errors.push(...error.details.map((detail) => detail.message));
      } else {
        req.body = value;
      }
    }

    // Validate request query
    if (schema.query) {
      const { error, value } = schema.query.validate(req.query, validationOptions);
      if (error) {
        errors.push(...error.details.map((detail) => detail.message));
      } else {
        req.query = value;
      }
    }

    // Validate request params
    if (schema.params) {
      const { error, value } = schema.params.validate(req.params, validationOptions);
      if (error) {
        errors.push(...error.details.map((detail) => detail.message));
      } else {
        req.params = value;
      }
    }

    if (errors.length > 0) {
      logger.warn('Validation error', { errors, path: req.path });
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors,
      });
      return;
    }

    next();
  };
};

// Common validation schemas
export const schemas = {
  createMessage: {
    body: Joi.object({
      from_number: Joi.string()
        .pattern(/^\+?[1-9]\d{1,14}$/)
        .required()
        .messages({
          'string.pattern.base': 'from_number must be a valid phone number',
        }),
      to_number: Joi.string()
        .pattern(/^\+?[1-9]\d{1,14}$/)
        .required()
        .messages({
          'string.pattern.base': 'to_number must be a valid phone number',
        }),
      message_text: Joi.string().min(1).max(4096).required(),
      message_type: Joi.string().valid('text', 'image', 'video', 'audio', 'document').optional(),
      metadata: Joi.object().optional(),
    }),
  },

  updateMessage: {
    params: Joi.object({
      id: Joi.string().uuid().required(),
    }),
    body: Joi.object({
      status: Joi.string().valid('pending', 'sent', 'delivered', 'read', 'failed').optional(),
      whatsapp_message_id: Joi.string().optional(),
      metadata: Joi.object().optional(),
    }).min(1),
  },

  getMessage: {
    params: Joi.object({
      id: Joi.string().uuid().required(),
    }),
  },

  webhook: {
    body: Joi.object({
      event_type: Joi.string().required(),
      payload: Joi.object().required(),
    }),
  },

  pagination: {
    query: Joi.object({
      limit: Joi.number().integer().min(1).max(100).optional(),
      offset: Joi.number().integer().min(0).optional(),
    }),
  },

  // WhatsApp Template Message Schema
  whatsappTemplate: {
    body: Joi.object({
      messaging_product: Joi.string().valid('whatsapp').required(),
      recipient_type: Joi.string().valid('individual').default('individual'),
      to: Joi.string().required(), // In production we'd use regex, but keeping simple for simulation flexibility
      type: Joi.string().valid('template').required(),
      template: Joi.object({
        name: Joi.string().required(),
        language: Joi.object({
          code: Joi.string().required(),
        }).required(),
        components: Joi.array()
          .items(
            Joi.object({
              type: Joi.string().valid('header', 'body', 'button', 'footer').required(),
              sub_type: Joi.string().valid('quick_reply', 'url', 'catalog').when('type', {
                is: 'button',
                then: Joi.required(),
                otherwise: Joi.forbidden(),
              }),
              index: Joi.string()
                .pattern(/^\d+$/)
                .when('type', { is: 'button', then: Joi.required(), otherwise: Joi.forbidden() }),
              parameters: Joi.array()
                .items(
                  Joi.object({
                    type: Joi.string()
                      .valid(
                        'text',
                        'currency',
                        'date_time',
                        'image',
                        'video',
                        'document',
                        'payload'
                      )
                      .required(),
                    text: Joi.string().when('type', {
                      is: 'text',
                      then: Joi.required(),
                    }),
                    payload: Joi.string().when('type', {
                      is: 'payload',
                      then: Joi.required(),
                    }),
                    currency: Joi.object({
                      fallback_value: Joi.string().required(),
                      code: Joi.string().required(),
                      amount_1000: Joi.number().integer().required(),
                    }).when('type', { is: 'currency', then: Joi.required() }),
                    date_time: Joi.object({
                      fallback_value: Joi.string().required(),
                    }).when('type', { is: 'date_time', then: Joi.required() }),
                    image: Joi.object({
                      link: Joi.string().uri().optional(),
                      id: Joi.string().optional(),
                    }).when('type', { is: 'image', then: Joi.required() }),
                    video: Joi.object({
                      link: Joi.string().uri().optional(),
                      id: Joi.string().optional(),
                    }).when('type', { is: 'video', then: Joi.required() }),
                    document: Joi.object({
                      link: Joi.string().uri().optional(),
                      id: Joi.string().optional(),
                      filename: Joi.string().optional(),
                    }).when('type', { is: 'document', then: Joi.required() }),
                  }).unknown(true)
                )
                .required(),
            })
          )
          .optional(),
      }).required(),
    }).unknown(true), // Allow other properties but validate the core structure
  },
};
