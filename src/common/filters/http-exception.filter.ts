import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  public catch(exception: HttpException, host: ArgumentsHost): void {
    const context = host.switchToHttp();

    const request = context.getRequest<Request>();

    const response = context.getResponse<Response>();

    const status = exception.getStatus();

    response.status(status).json({
      message: exception.message,
      path: request.url,
      statusCode: status,
      timestamp: new Date().toISOString(),
    });
  }
}
