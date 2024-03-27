import { Controller, Get } from '@nestjs/common';

@Controller('user')
export class UserController {
  @Get('me')
  getAllUsers() {
    return 'this is me';
  }
}
