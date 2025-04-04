import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

@Injectable()
export class ValidationPipe implements PipeTransform {
  public async transform(
    value: object,
    { metatype }: ArgumentMetadata,
  ): Promise<object> {
    if (metatype) {
      const object = plainToInstance<object, object>(metatype, value);

      const errors = await validate(object);

      if (errors.length) {
        throw new BadRequestException(errors);
      }
    }

    return value;
  }
}
