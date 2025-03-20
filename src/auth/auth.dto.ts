import { Exclude } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}

export class LoginReturnDto {
  @Exclude()
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;

  constructor(
    user: { id: string; email: string; name: string; role: string },
    accessToken: string,
    refreshToken: string,
  ) {
    this.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }
}
