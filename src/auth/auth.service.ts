import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';

@Injectable()
class AuthService {
  constructor(private readonly prisma: PrismaService) {}
  async login(dto: AuthDto) {
    // generate hashed password
    const hashedPassword = await argon2.hash(dto.password);
    // save user with hased password into db
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        hash: hashedPassword,
      },
    });

    delete user.hash;

    // return newly saved user
    return user;
  }

  signup() {
    return 'signup';
  }
}

export default AuthService;
