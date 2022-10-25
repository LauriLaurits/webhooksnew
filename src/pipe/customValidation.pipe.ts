import {
  ArgumentMetadata,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  PipeTransform,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Injectable()
export class CustomValidationPipe implements PipeTransform {
  private readonly logger = new Logger(this.constructor.name, {
    timestamp: true,
  });
  async transform(value: any, metadata: ArgumentMetadata) {
    const object = plainToClass(metadata.metatype, value);
    const errors = await validate(object);

    if (errors.length === 0) {
      return value;
    }
    //todo send email if payload fails
    this.logger.error(`Errors in payload`);
    throw new HttpException({ errors }, HttpStatus.UNPROCESSABLE_ENTITY);
  }
}
