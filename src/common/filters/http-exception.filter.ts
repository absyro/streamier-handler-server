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
    const context = host.switchToHttp(),
      request = context.getRequest<Request>(),
      response = context.getResponse<Response>(),
      status = exception.getStatus();

    response.status(status).json({
      message: exception.message,
      path: request.url,
      statusCode: status,
      timestamp: new Date().toISOString(),
    });
  }
}
