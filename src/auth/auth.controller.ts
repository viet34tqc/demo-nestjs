import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import AuthService from './auth.service';
import { GetUser } from './decorators/user.decorator';
import { AuthDto } from './dto';
import JwtRefreshGuard from './guard/jwt-refresh.guard';
import JwtGuard from './guard/jwt.guard';

@Controller('auth')
class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  signup(@Body() dto: AuthDto) {
    return this.authService.signup(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() dto: AuthDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  logout(@GetUser('id') id: number) {
    console.log('id', id)
    return this.authService.logout(id);
  }

  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  refreshToken(
    @GetUser('sub') id: number,
    @GetUser('refreshToken') refreshToken: string,
  ) {
    return this.authService.refreshToken(id, refreshToken);
  }
}

export default AuthController;
