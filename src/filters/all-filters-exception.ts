import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Response } from 'express';
import { ZodError } from 'zod';

@Catch()
export class AllFiltersException extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    let message: string = 'Internal server error';
    let statusCode: number = 500;

    if (exception instanceof Error) {
      message = exception.message || message;
    }

    if (exception instanceof BadRequestException) {
      message = exception.message;
      statusCode = exception.getStatus();
    }

    if (exception instanceof NotFoundException) {
      message = 'The requested url is not found';
      statusCode = 404;
    }

    if (exception instanceof UnauthorizedException) {
      statusCode = exception.getStatus();
    }

    if (exception instanceof ZodError) {
      statusCode = 400;
      const issue = exception.issues[0];
      if (issue) {
        message = `${issue.path}: ${issue.message}`;
      }
    }

    res.status(statusCode).json({ message });
    super.catch(exception, host);
  }
}
