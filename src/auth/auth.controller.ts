import { Controller, Post } from '@nestjs/common';
import AuthService from './auth.service';

@Controller('auth')
class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login() {
    return this.authService.login();
  }

  @Post('signup')
  signup() {
    return this.authService.signup();
  }
}

export default AuthController;
