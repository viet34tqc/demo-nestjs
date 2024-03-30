import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/decorators/user.decorator';
import JwtGuard from 'src/auth/guard/jwt.guard';
import EditUserDto from './dto/edit-user.dto';
import { UserService } from './user.service';

@UseGuards(JwtGuard) // This will make @GetUser() work
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get('me')
  getMe(@GetUser() user: User) {
    return user;
  }

  @Patch()
  editUser(@GetUser('id') id, @Body() user: EditUserDto) {
    return this.userService.editUser(id, user);
  }
}
