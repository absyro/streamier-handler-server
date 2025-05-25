import { BadRequestException, Catch, ExceptionFilter } from "@nestjs/common";
import { ZodValidationException } from "nestjs-zod";
import { fromZodError } from "zod-validation-error";

@Catch(ZodValidationException)
export class ZodValidationExceptionFilter implements ExceptionFilter {
  public catch(exception: ZodValidationException): void {
    const zodError = exception.getZodError();

    const formatted = fromZodError(zodError);

    throw new BadRequestException(formatted.message);
  }
}
