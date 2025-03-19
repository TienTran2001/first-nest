import { Exclude } from 'class-transformer';

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
