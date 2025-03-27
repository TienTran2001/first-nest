import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthRepository {
  constructor(private prisma: PrismaService) {}

  async findUserByEmail(email: string) {
    return await this.prisma.user.findUnique({ where: { email } });
  }

  async findUserById(id: string) {
    return await this.prisma.user.findUnique({ where: { id } });
  }

  async findUserByRefreshToken(userId: string, refreshToken: string) {
    return await this.prisma.user.findUnique({
      where: { id: userId, refreshToken },
    });
  }

  /**
   * @todo register new account
   * @param data
   * @return new user
   */
  async createUser(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({ data });
  }

  /**
   * @todo save refresh token
   * @param userId
   * @param refreshToken
   */
  async saveRefreshToken(userId: string, refreshToken: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken },
    });
  }
}
