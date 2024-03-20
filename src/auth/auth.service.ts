import { Injectable } from '@nestjs/common';

@Injectable()
class AuthService {
  login() {
    return 'login';
  }

  signup() {
    return 'signup';
  }
}

export default AuthService;
