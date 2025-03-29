import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import { ApiError } from './error.middleware';

/**
 * Middleware factory to validate request data against a Joi schema
 * @param schema The Joi validation schema
 * @param property The request property to validate (body, params, query)
 */
export const validate = (schema: Schema, property: 'body' | 'params' | 'query' = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });
    
    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(', ');
        
      next(new ApiError(400, `Validation error: ${errorMessage}`));
      return;
    }
    
    next();
  };
};
