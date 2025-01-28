import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './login.dto';
import { Users } from '../users/users.model';
import { AuthGuard, ExpressGuarded } from './guards/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto): Promise<{ accessToken: string }> {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async me(@Req() request: ExpressGuarded): Promise<Partial<Users>> {
    return request.user;
  }
}
