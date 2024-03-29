import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import AuthService from './auth.service';
import { AuthDto } from './dto';

@Controller('auth')
class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signup(@Body() dto: AuthDto) {
    return this.authService.signup(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() dto: AuthDto) {
    return this.authService.login(dto);
  }
}

export default AuthController;
