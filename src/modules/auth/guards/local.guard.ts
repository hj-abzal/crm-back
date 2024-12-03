import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { Users } from '../../users/users.model';
import { Request as ExpressRequest } from 'express';

export type ExpressGuarded = ExpressRequest & {
  user?: Partial<Users>;
};

@Injectable()
export class LocalGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<ExpressGuarded>();
    const body = req.body;
    const user = await this.authService.validateUser(body);
    if (!user) {
      throw new UnauthorizedException();
    }
    req.user = user;
    return true;
  }
}
