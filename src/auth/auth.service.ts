import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import type { Cache } from 'cache-manager';
import { randomInt } from 'crypto';
import { AuthRepository } from 'src/auth/auth.repository';
import { TypeRegisterSchema } from 'src/auth/schemas/register.schema';
import { MailService } from 'src/email/mail.service';

export interface IPayload {
  id: string;
  email: string;
  roles: Role[];
}

@Injectable()
export class AuthService {
  constructor(
    private authRepository: AuthRepository,
    private jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private mailService: MailService,
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
    return await this.authRepository.findUserByEmail(email);
  }

  async findUserById(id: string) {
    return await this.authRepository.findUserById(id);
  }

  async requestOtp(email: string) {
    const user = await this.findUserByEmail(email);
    if (user) {
      throw new BadRequestException('User already exists');
    }
    const otp = randomInt(100000, 999999).toString();
    await this.cacheManager.set(`otp:${email}`, otp, 60000);
    await this.mailService.sendOtp(email, otp);
    console.log(`OTP for ${email}: ${otp}`);
  }

  /**
   * @todo register new account
   * @param email
   * @param password
   * @param name
   * @return new user
   */
  async register(dto: TypeRegisterSchema) {
    const { email, password, name, otp } = dto;

    const cachedOtp = await this.cacheManager.get(`otp:${email}`);

    if (!cachedOtp || cachedOtp !== otp) {
      throw new BadRequestException('OTP is incorrect or expired');
    }

    await this.cacheManager.del(`otp:${email}`);

    const hashedPassword = await this.hashPassword(password);

    return this.authRepository.createUser({
      email,
      name,
      password: hashedPassword,
    });
  }

  /**
   * @todo login and generate token
   * @param email
   * @param password
   * @return user
   */
  async login(email: string, pass: string) {
    const user = await this.authRepository.findUserByEmail(email);

    if (!user || !(await this.comparePassword(pass, user.password))) {
      throw new UnauthorizedException('Email or password is incorrect');
    }

    const tokens = this.generateTokens(user.id, user.email, user.role);
    await this.authRepository.saveRefreshToken(user.id, tokens.refreshToken);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return {
      user: result,
      ...tokens,
    };
  }

  /**
   * @todo generate token
   * @param userId
   * @param email
   * @return token and refresh token
   */
  private generateTokens(userId: string, email: string, roles: Role[]) {
    const payload = { id: userId, email, roles };

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
   * @todo refresh access token and generate new tokens: access token and refresh token
   * @param refreshToken
   * @return new access token
   */
  async refreshAccessToken(refreshToken: string) {
    const payload = await this.jwtService.verifyAsync<IPayload>(refreshToken, {
      secret: process.env.JWT_SECRET,
    });

    const existingUser = await this.authRepository.findUserByRefreshToken(
      payload.id,
      refreshToken,
    );

    if (!existingUser) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = this.generateTokens(
      payload.id,
      payload.email,
      payload.roles,
    );

    // save refresh token to db
    await this.authRepository.saveRefreshToken(payload.id, tokens.refreshToken);

    return {
      ...tokens,
    };
  }
}
