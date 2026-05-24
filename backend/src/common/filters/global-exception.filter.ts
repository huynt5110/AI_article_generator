import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApplicationException } from '../exceptions/application.exception';
import { ErrorCode, ERROR_CODES } from '../constants/error-codes';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorCode: ErrorCode = ERROR_CODES.INTERNAL_SERVER_ERROR;
    let details = null;

    if (exception instanceof ApplicationException) {
      status = exception.statusCode;
      message = exception.message;
      errorCode = exception.errorCode;
      details = exception.details;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responsePayload = exception.getResponse() as any;
      
      message = responsePayload.message || exception.message;
      if (Array.isArray(message)) {
        message = message[0]; // Take first validation message
      }
      
      errorCode =
        status === HttpStatus.BAD_REQUEST
          ? ERROR_CODES.VALIDATION_ERROR
          : status === HttpStatus.UNAUTHORIZED
          ? ERROR_CODES.UNAUTHORIZED
          : ERROR_CODES.BAD_REQUEST;
          
      details = responsePayload;
    } else {
      this.logger.error(
        `Unhandled exception: ${exception}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    const errorResponse = {
      statusCode: status,
      message,
      error: errorCode,
      details: details && status !== HttpStatus.INTERNAL_SERVER_ERROR ? details : undefined,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} ${status} - ${message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn(`${request.method} ${request.url} ${status} - ${message}`);
    }

    response.status(status).json(errorResponse);
  }
}
