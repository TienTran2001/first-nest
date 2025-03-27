import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { loginResponseSchema } from 'src/auth/schemas/login-response';
import { loginSchema, TypeLoginSchema } from 'src/auth/schemas/login.schema';
import {
  registerSchema,
  requestOtpSchema,
  TypeRegisterSchema,
  TypeRequestOtpSchema,
} from 'src/auth/schemas/register.schema';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

interface RequestWithUser extends Request {
  user: {
    id: string;
    email: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('otp/request')
  async requestOtp(
    @Body(new ZodValidationPipe(requestOtpSchema)) body: TypeRequestOtpSchema,
  ) {
    const { email } = body;
    await this.authService.requestOtp(email);
    return {
      message: 'OTP requested successfully',
    };
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  async register(
    @Body(new ZodValidationPipe(registerSchema)) body: TypeRegisterSchema,
  ) {
    const user = await this.authService.findUserByEmail(body.email);
    if (user) {
      throw new BadRequestException('User already exists');
    }
    return this.authService.register({
      email: body.email,
      password: body.password,
      name: body.name,
      otp: body.otp,
    });
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body(new ZodValidationPipe(loginSchema)) body: TypeLoginSchema) {
    const { user, refreshToken, accessToken } = await this.authService.login(
      body.email,
      body.password,
    );

    return loginResponseSchema.parse({
      message: 'Login successful',
      user,
      refreshToken,
      accessToken,
    });
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  async getProfile(@Request() req: RequestWithUser) {
    const { id } = req.user;

    const user = await this.authService.findUserById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, role, ...result } = user;
    return {
      message: 'Profile fetched successfully',
      data: result,
    };
  }

  @Post('refresh-token')
  async refreshToken(@Body() body: { refreshToken: string }) {
    const { refreshToken } = body;

    const tokens = await this.authService.refreshAccessToken(refreshToken);

    return {
      message: 'Token refreshed successfully',
      tokens,
    };
  }
}
