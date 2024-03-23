import { Body, Controller, Post } from '@nestjs/common';
import AuthService from './auth.service';
import { AuthDto } from './dto';

@Controller('auth')
class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() dto: AuthDto) {
    return this.authService.login(dto);
  }

  @Post('signup')
  signup() {
    return this.authService.signup();
  }
}

export default AuthController;
