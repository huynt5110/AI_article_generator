import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode, ERROR_CODES } from '../constants/error-codes';

export class ApplicationException extends HttpException {
  constructor(
    public readonly message: string,
    public readonly errorCode: ErrorCode,
    public readonly statusCode: HttpStatus,
    public readonly details?: Record<string, any>,
  ) {
    super(
      {
        message,
        errorCode,
        statusCode,
        details,
      },
      statusCode,
    );
  }
}

export class ValidationException extends ApplicationException {
  constructor(message: string, details?: Record<string, any>) {
    super(message, ERROR_CODES.VALIDATION_ERROR, HttpStatus.BAD_REQUEST, details);
  }
}

export class UnauthorizedException extends ApplicationException {
  constructor(message: string = 'Unauthorized', details?: Record<string, any>) {
    super(message, ERROR_CODES.UNAUTHORIZED, HttpStatus.UNAUTHORIZED, details);
  }
}

export class ForbiddenException extends ApplicationException {
  constructor(message: string = 'Forbidden', details?: Record<string, any>) {
    super(message, ERROR_CODES.FORBIDDEN, HttpStatus.FORBIDDEN, details);
  }
}

export class NotFoundException extends ApplicationException {
  constructor(resource: string, details?: Record<string, any>) {
    super(`${resource} not found`, ERROR_CODES.NOT_FOUND, HttpStatus.NOT_FOUND, details);
  }
}

export class ConflictException extends ApplicationException {
  constructor(message: string, details?: Record<string, any>) {
    super(message, ERROR_CODES.CONFLICT, HttpStatus.CONFLICT, details);
  }
}
