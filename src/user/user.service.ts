import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import EditUserDto from './dto/edit-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}
  async editUser(userId: string, user: EditUserDto) {
    const updatedUser = await this.prisma.user.update({
      where: {
        id: +userId,
      },
      data: user,
    });

    delete updatedUser.hash;
    return updatedUser;
  }
}
