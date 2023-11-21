import { CustomError } from '@/lib/custom-error';
import { type ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

export const handleErrorRequest: ErrorRequestHandler = (
  err,
  req,
  res,
  next
) => {
  next;
  let message: string = err.message || 'Internal Server Error';
  let statusCode: number = err.statusCode || 500;
  if (err instanceof Error) {
    message = err.message || message;
  }

  if (err instanceof ZodError && err.issues[0]?.message !== undefined) {
    statusCode = 400;
    const { path, message: msg } = err.issues[0];
    message = `${path[0] ? `${path[0]}: ` : ''}${msg}`;
  }

  if (err instanceof CustomError) {
    message = err.message;
    statusCode = err.statusCode;
  }

  return res.status(statusCode).json({ message });
};
