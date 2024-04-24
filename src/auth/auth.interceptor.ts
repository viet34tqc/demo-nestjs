import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class AuthInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // This basically call the route handler in the controller
    return next.handle().pipe(
      map((data) => {
        // console.log('data', data);
        // Here is where we can modify the data response before it's sent to the client
        return data;
      }),
    );
  }
}
