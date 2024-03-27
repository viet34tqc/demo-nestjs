import { Body, Controller, Get, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import JwtGuard from 'src/auth/guard/jwt.guard';

@Controller('user')
export class UserController {
  @UseGuards(JwtGuard)
  @Get('me')
  getMe(@Body() data: User) {
    return data;
  }
}
