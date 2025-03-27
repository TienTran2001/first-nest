import { Controller, Get } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from 'src/auth/roles.decorator';
import { UsersService } from './users.service';

@Controller('users') //decorator
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // @UseGuards(AuthGuard)
  @Get()
  @Roles(Role.ADMIN)
  getUsers() {
    return this.usersService.getUsers();
  }
}
