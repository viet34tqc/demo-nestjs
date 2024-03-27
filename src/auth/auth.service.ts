import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import * as argon2 from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';

@Injectable()
class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}
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

      // send back token
      return this.signToken(user.id, user.email);
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

    // send back token
    return this.signToken(user.id, user.email);
  }

  async signToken(
    userId: number,
    email: string,
  ): Promise<{ accessToken: string }> {
    const payload = {
      sub: userId,
      email,
    };
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: this.config.get('JWT_SECRET'),
    });
    return {
      accessToken: token,
    };
  }
}

export default AuthService;
