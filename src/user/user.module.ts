import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { UserController } from './user.controller';
import { UserMiddleware } from './user.middleware';
import { UserService } from './user.service';

@Module({
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply middleware for all routes of 'user'
    consumer.apply(UserMiddleware).forRoutes(UserController);
    consumer.apply(UserMiddleware).forRoutes('user');
    // Only apply middleware for GET method of 'user' route
    consumer.apply(UserMiddleware).forRoutes({
      path: 'user',
      method: RequestMethod.GET,
    });
  }
}
