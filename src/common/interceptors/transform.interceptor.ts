import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';

export interface Response<T> {
  data: T;
  statusCode: number;
  message: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  Response<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const response = context.switchToHttp().getResponse<Response>();
    const statusCode = response.statusCode as number;
    return next.handle().pipe(
      /* eslint-disable @typescript-eslint/no-unsafe-assignment */
      map((data) => ({
        data,
        statusCode,
        message: 'Success',
      })),
      /* eslint-enable @typescript-eslint/no-unsafe-assignment */
    );
  }
}
