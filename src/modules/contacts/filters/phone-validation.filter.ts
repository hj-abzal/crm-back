import { ExceptionFilter, Catch, ArgumentsHost, BadRequestException } from '@nestjs/common';
import { Response } from 'express';
import { COMMON_ERROR_MESSAGES } from '../constants/error-messages';

@Catch(BadRequestException)
export class PhoneValidationFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as any;

    let errorMessage = '';
    if (typeof exceptionResponse === 'object') {
      if (Array.isArray(exceptionResponse.message)) {
        errorMessage = exceptionResponse.message.join(', ');
      } else {
        errorMessage = exceptionResponse.message;
      }
    } else {
      errorMessage = exceptionResponse;
    }

    response.status(status).json({
      statusCode: status,
      error: COMMON_ERROR_MESSAGES.VALIDATION_ERROR,
      message: errorMessage,
      details: errorMessage,
      timestamp: new Date().toISOString(),
    });
  }
} 