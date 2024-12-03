import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ExpressGuarded, LocalGuard } from './guards/local.guard';
import { AuthService } from './auth.service';
import { Request } from '@nestjs/common';
import { CreateUserDto } from '../users/create-user.dto';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Post('login')
  @UseGuards(LocalGuard)
  async login(
    @Request() req: ExpressGuarded,
  ): Promise<{ accessToken: string }> {
    try {
      return this.authService.login(req.user);
    } catch (error) {
      console.error('Error during login:', error);
      throw new UnauthorizedException();
    }
  }

  @Post('register')
  async register(@Body() dto: CreateUserDto) {
    return this.authService.register(dto);
  }

  @Get('confirm')
  async confirm(
    @Query('email') email: string,
    @Query('code') code: string,
    @Res() res: Response,
  ) {
    await this.authService.verifyCode(email, code);
    return res.redirect(this.configService.get('FRONT_LOGIN_REDIRECT_URL'));
  }
}
