import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { Users } from '../../users/users.model';
import { Request as ExpressRequest } from 'express';
import { Reflector } from '@nestjs/core';
import { UsersService } from '../../users/users.service';
import { USER_ROLE } from '../../users/user-role.enums';

import { SetMetadata } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

export const Role = (role: USER_ROLE.ADMIN) => SetMetadata('role', role);

export type ExpressGuarded = ExpressRequest & {
  user?: Partial<Users>;
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly userService: UsersService,
    private readonly reflector: Reflector,
    private readonly configureService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<ExpressGuarded>();
    const requiredRole = this.reflector.get<USER_ROLE.ADMIN>(
      'role',
      context.getHandler(),
    );
    const token = this.extractToken(request);

    const decodedToken = this.verifyToken(token);
    const user = await this.validateUser(decodedToken);

    if (token !== user.accessToken) {
      throw new ForbiddenException();
    }

    if (requiredRole && user.role !== requiredRole) {
      throw new ForbiddenException(
        `Access denied: ${requiredRole} role required`,
      );
    }

    request.user = user;
    return true;
  }

  private extractToken(request: ExpressGuarded): string {
    const authHeader = request.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }
    return authHeader.split(' ')[1];
  }

  private verifyToken(token: string): any {
    try {
      return this.jwtService.verify(
        token,
        this.configureService.get('JWT_SECRET'),
      );
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private async validateUser(decodedToken: any): Promise<Partial<Users>> {
    if (
      !decodedToken ||
      typeof decodedToken !== 'object' ||
      !decodedToken.username
    ) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const user = await this.userService.findByUsername(decodedToken.username);
    if (!user) {
      throw new UnauthorizedException('Invalid token: user not found');
    }

    return user;
  }
}
