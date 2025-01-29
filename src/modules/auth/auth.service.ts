import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { Users } from '../users/users.model';
import { CodeUtil } from '../../utils/code.util';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './login.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(dto: LoginDto): Promise<Users> {
    this.logger.log(`Validating user with username: ${dto.username}`);
    try {
      let user: Users;
      if (dto.username) {
        user = await this.usersService.findByUsername(dto.username);
      }

      if (!user) {
        this.logger.warn(`User not found: ${dto.username}`);
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const isPasswordValid = await CodeUtil.checkPassword(
        dto.password,
        user.password,
      );
      if (!isPasswordValid) {
        this.logger.warn(`Invalid password for user: ${dto.username}`);
        throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
      }

      this.logger.log(`User validated successfully: ${dto.username}`);
      return user;
    } catch (error) {
      this.logger.error(`Error validating user: ${dto.username}`, error);
      throw error;
    }
  }

  async login(dto: LoginDto): Promise<{ accessToken: string }> {
    this.logger.log(
      `Logging in user: ${dto.username} with deviceId: ${dto.deviceId}`,
    );
    const user = await this.validateUser(dto);
    if (user) {
      const { userId, firstName, lastName, username } = user;
      const accessToken = this.jwtService.sign(
        {
          userId,
          firstName,
          lastName,
          username,
          deviceId: dto.deviceId,
        },
        {
          expiresIn: this.configService.get('EXPIRES_IN') || '3d',
        },
      );

      this.logger.log(`User logged in successfully: ${username}`);
      return { accessToken };
    }
  }
}
