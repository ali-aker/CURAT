import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'حدث خطأ غير متوقع';
    let errors: string[] = [];

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const res = exceptionResponse as any;
        message =
          res.message && !Array.isArray(res.message)
            ? res.message
            : 'بيانات غير صحيحة';
        errors = Array.isArray(res.message) ? res.message : [];
      }
    }

    response.status(statusCode).json({
      success: false,
      statusCode,
      message,
      errors,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
