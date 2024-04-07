import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import * as argon2 from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';

// Flow

// 1. User signs up or signs in: create access tokens and refresh tokens. Save refresh token in db. Return both two tokens
// 2. Refresh token: compare hash of refresh tokens. If they match, return new access token

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

      const tokens = await this.signToken(user.id, user.email);
      // Save refresh token in db
      await this.saveRefreshTokenInDb(String(user.id), tokens.refreshToken);

      // send back tokens
      return tokens;
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

    const tokens = await this.signToken(user.id, user.email);
    // Save refresh token in db
    await this.saveRefreshTokenInDb(String(user.id), tokens.refreshToken);

    // send back tokens
    return tokens;
  }

  async logout(userId: number) {
    // Remove refresh token from user in db
    try {
      await this.prisma.user.update({
        where: {
          id: userId,
          hashRt: {
            not: null,
          },
        },
        data: {
          hashRt: null,
        },
      });
      return true;
    } catch (error) {
      // In case, we use deleted token to logout
      return new ForbiddenException('User token has already been deleted');
    }
  }

  // Flow:
  // - Send refresh request
  // - Compare hash of refresh token
  // - Save refresh token in db
  // - Send back access token and refresh token

  async refreshToken(userId: number, refreshToken: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user || !user.hashRt) throw new ForbiddenException('Access Denied');

    const isRefreshTokenMatch = await argon2.verify(user.hashRt, refreshToken);
    if (!isRefreshTokenMatch) throw new ForbiddenException('Access Denied');
    const tokens = await this.signToken(user.id, user.email);
    // Save refresh token in db
    await this.saveRefreshTokenInDb(String(user.id), tokens.refreshToken);

    // send back tokens
    return tokens;
  }

  async signToken(
    userId: number,
    email: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      sub: userId,
      email,
    };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        expiresIn: '15m',
        secret: this.config.get('JWT_SECRET'),
      }),
      this.jwt.signAsync(payload, {
        expiresIn: '60m',
        secret: this.config.get('JWT_SECRET'),
      }),
    ]);
    return {
      accessToken,
      refreshToken,
    };
  }

  async saveRefreshTokenInDb(userId: string, refreshToken: string) {
    const hashRt = await argon2.hash(refreshToken);
    await this.prisma.user.update({
      where: {
        id: +userId,
      },
      data: {
        hashRt,
      },
    });
  }
}

export default AuthService;
