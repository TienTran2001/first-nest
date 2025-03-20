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
import { LoginDto, LoginReturnDto } from './auth.dto';
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

  @Post('register')
  async register(
    @Body() body: { email: string; password: string; name: string },
  ) {
    const user = await this.authService.findUserByEmail(body.email);
    if (user) {
      throw new BadRequestException('User already exists');
    }
    return this.authService.register(body.email, body.password, body.name);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() body: LoginDto) {
    const { user, refreshToken, accessToken } = await this.authService.login(
      body.email,
      body.password,
    );
    return new LoginReturnDto(user, refreshToken, accessToken);
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
}
