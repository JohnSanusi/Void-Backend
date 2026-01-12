import {
  ValidationPipe,
  ValidationError,
  BadRequestException,
} from '@nestjs/common';

export const GlobalValidationPipe = new ValidationPipe({
  whitelist: true,
  transform: true,
  forbidNonWhitelisted: true,
  transformOptions: {
    enableImplicitConversion: true,
  },
  exceptionFactory: (errors: ValidationError[]) => {
    const messages = errors.map((error) => {
      return `${error.property} has wrong value ${error.value}, constraints: ${Object.values(error.constraints || {}).join(', ')}`;
    });
    return new BadRequestException(messages);
  },
});
