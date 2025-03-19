import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './create-user.dto';

@Controller('users') //decorator
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED) // 201
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async createUser(@Body() createUserDto: CreateUserDto) {
    const { name, email, password } = createUserDto;

    // check if email already exists
    const existingUser = await this.usersService.findByEmail(email);

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const user = await this.usersService.createUser(name, email, password);

    console.log(user);

    return {
      message: 'User created successfully',
      data: user,
    };
  }

  @Get()
  getUsers() {
    return this.usersService.getUsers();
  }
}
