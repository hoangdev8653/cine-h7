import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Logger } from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger('HttpException');

    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception.getStatus
            ? exception.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;

        const exceptionResponse = exception.getResponse();
        const error =
            typeof exceptionResponse === 'string'
                ? { message: exceptionResponse }
                : (exceptionResponse as object);

        // Ghi log chi tiết lỗi cho các lỗi 500 hoặc 400 quan trọng
        if (status >= 500) {
            this.logger.error(
                `HÀNH ĐỘNG LỖI [${status}]: ${request.method} ${request.url}`,
                JSON.stringify({ ...error, body: request.body }),
                'ExceptionFilter',
            );
        } else {
            this.logger.warn(
                `CẢNH BÁO [${status}]: ${request.method} ${request.url}`,
                JSON.stringify(error),
            );
        }

        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            ...error,
        });
    }
}