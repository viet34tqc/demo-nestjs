import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import * as argon2 from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';

@Injectable()
class AuthService {
  constructor(private readonly prisma: PrismaService) {}
  async signup(dto: AuthDto) {
    try {
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
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        // Code for record already exists
        if (error.code === 'P2002') {
          throw new ForbiddenException('Email already exists');
        }
      }
    }
  }

  async login({ email, password }: AuthDto) {
    // Find the user by email
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    // If the user didn't exist, throw exception
    if (!user) {
      throw new ForbiddenException('Credentials incorrect');
    }
    // check the password
    const isPwdValid = await argon2.verify(user.hash, password);

    // If passwords don't match, throw exception
    if (!isPwdValid) {
      throw new ForbiddenException('Credentials incorrect');
    }

    delete user.hash;
    // send back the user
    return user;
  }
}

export default AuthService;
