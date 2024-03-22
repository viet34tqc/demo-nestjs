import { Body, Controller, Post } from '@nestjs/common';
import AuthService from './auth.service';

@Controller('auth')
class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() dto: any) {
    return this.authService.login();
  }

  @Post('signup')
  signup() {
    return this.authService.signup();
  }
}

export default AuthController;
