import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomInt } from 'crypto';
import { AuthRepository } from 'src/auth/auth.repository';
import { TypeRegisterSchema } from 'src/auth/schemas/register.schema';

@Injectable()
export class AuthService {
  constructor(
    private authRepository: AuthRepository,
    private jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
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

  /**
   * @todo register new account
   * @param email
   * @param password
   * @param name
   * @return new user
   */
  async register(dto: TypeRegisterSchema) {
    const { email, password, name, otp } = dto;

    const cachedOtp = await this.cacheManager.keys(`otp:${email}`);

    const hashedPassword = await this.hashPassword(password);

    return this.authRepository.createUser({
      email,
      name,
      password: hashedPassword,
    });
  }

  async requestOtp(email: string) {
    const otp = randomInt(100000, 999999).toString();
    await this.cacheManager.set(`otp:${email}`, otp, { ttl: 300 });
    console.log(`OTP cho ${email}: ${otp}`);
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

    const tokens = this.generateTokens(user.id, user.email);
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
  private generateTokens(userId: string, email: string) {
    const payload = { id: userId, email };

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
}
