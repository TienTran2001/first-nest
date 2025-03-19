import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async createUser(name: string, email: string) {
    return this.prisma.user.create({
      data: { name, email },
    });
  }

  async getUsers() {
    return this.prisma.user.findMany();
  }
}
