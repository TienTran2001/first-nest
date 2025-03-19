import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginReturnDto } from './auth.dto';

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

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const { user, refreshToken, accessToken } = await this.authService.login(
      body.email,
      body.password,
    );
    return new LoginReturnDto(user, refreshToken, accessToken);
  }
}
