import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request: Request & { headers: { authorization: string } } = context
      .switchToHttp()
      .getRequest();

    const token = request.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new ForbiddenException('No token provided');
    }

    try {
      const payload: { id: string; email: string; roles: Role[] } =
        await this.jwtService.verify(token);
      const userRoles = payload.roles;

      return requiredRoles.some((role) => userRoles.includes(role));
    } catch (error) {
      console.log('error: ', error);
      throw new ForbiddenException('Access denied');
    }
  }
}
