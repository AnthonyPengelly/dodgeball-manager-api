import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ApiError } from './error.middleware';

/**
 * Middleware for validating request data against a Joi schema
 * @param schema Joi schema to validate against
 * @returns Express middleware function
 */
export const validationMiddleware = (schema: Joi.Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(', ');
      
      return next(new ApiError(400, `Validation error: ${errorMessage}`));
    }

    next();
  };
};
