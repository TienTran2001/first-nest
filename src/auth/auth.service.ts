import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * @todo hash password
   * @param password
   * @return hashed password
   */
  private async hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
  }

  /**
   * @todo compare password when login
   * @param password
   * @param hashedPassword
   * @return true if password is correct
   */
  private async comparePassword(password: string, hashedPassword: string) {
    return await bcrypt.compare(password, hashedPassword);
  }

  async findUserByEmail(email: string) {
    return await this.prisma.user.findUnique({ where: { email } });
  }

  /**
   * @todo register new account
   * @param email
   * @param password
   * @param name
   * @return new user
   */
  async register(email: string, password: string, name: string) {
    const hashedPassword = await this.hashPassword(password);

    return this.prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });
  }

  /**
   * @todo login and generate token
   * @param email
   * @param password
   * @return user
   */
  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !(await this.comparePassword(password, user.password))) {
      throw new UnauthorizedException('Email or password is incorrect');
    }

    const tokens = this.generateTokens(user.id, user.email);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return {
      user,
      ...tokens,
    };
  }

  /**
   * @todo generate token
   * @param userId
   * @param email
   * @return token and refresh token
   */
  private generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '15h',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  /**
   * @todo save refresh token
   * @param userId
   * @param refreshToken
   */
  private async saveRefreshToken(userId: string, refreshToken: string) {
    const hashedToken = await this.hashPassword(refreshToken);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashedToken },
    });
  }
}
