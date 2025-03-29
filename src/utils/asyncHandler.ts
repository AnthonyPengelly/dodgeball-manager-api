import { Request, Response, NextFunction } from 'express';

/**
 * Wrapper for async route handlers to properly catch errors
 * and pass them to Express error middleware
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
