import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';

// Custom API error class
export class ApiError extends Error {
  statusCode: number;
  
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handling middleware
export const errorHandler: ErrorRequestHandler = (
  err: Error | ApiError, 
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {
  console.error('Error:', err);
  
  // If it's our custom API error, use its status code and message
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      error: err.message
    });
    return;
  }
  
  // For unhandled errors, send a generic 500 response
  res.status(500).json({
    error: 'Internal server error'
  });
};
