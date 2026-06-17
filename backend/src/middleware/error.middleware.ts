import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(`[Error] ${err.name}: ${err.message}`);
  if (err.stack) {
    console.error(err.stack);
  }

  // Handle Zod Validation Errors (if they slip past validate middleware)
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Validation Error',
      errors: err.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
    });
  }

  // Handle Mongoose CastErrors (Invalid ObjectIds)
  if (err.name === 'CastError') {
    return res.status(400).json({ message: `Resource not found with ID of ${err.value}` });
  }

  // Handle Mongoose Duplicate Key Errors
  if (err.code === 11000) {
    return res.status(400).json({ message: 'Duplicate field value entered' });
  }

  // Handle Mongoose Validation Errors
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val: any) => val.message).join(', ');
    return res.status(400).json({ message });
  }

  // Handle JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token. Please log in again.' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token expired. Please log in again.' });
  }

  // Default to 500 Internal Server Error
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
