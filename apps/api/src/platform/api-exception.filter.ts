import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import type { FastifyReply, FastifyRequest } from "fastify";
import { randomUUID } from "node:crypto";

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<FastifyReply>();
    const request = context.getRequest<FastifyRequest>();
    const requestId = request.id?.toString() ?? randomUUID();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : undefined;
    const details =
      typeof exceptionResponse === "object" && exceptionResponse !== null
        ? exceptionResponse
        : {};
    const message =
      typeof exceptionResponse === "string"
        ? exceptionResponse
        : "message" in details && typeof details.message === "string"
          ? details.message
          : status === 500
            ? "An unexpected error occurred."
            : "The request could not be completed.";
    const code =
      "code" in details && typeof details.code === "string"
        ? details.code
        : status === 500
          ? "INTERNAL_ERROR"
          : "REQUEST_REJECTED";

    void response.status(status).send({
      statusCode: status,
      code,
      message,
      requestId,
    });
  }
}
