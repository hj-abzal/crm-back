import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/create-user.dto';
import { Users } from '../users/users.model';
import { USER_STATUS } from '../users/user-status.enums';
import { CodeUtil } from '../../utils/code.util';
import { JwtService } from '@nestjs/jwt';
import { MailsService } from '../mails/mails.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailsService: MailsService,
  ) {}

  async validateUser(dto: CreateUserDto): Promise<Partial<Users>> {
    this.logger.log(`Validating user with email: ${dto.email}`);
    try {
      let user: Users;
      if (dto.email) {
        user = await this.usersService.findByEmail(dto.email);
      }

      if (!user) {
        this.logger.warn(`User not found: ${dto.email}`);
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      if (user.status !== USER_STATUS.VERIFIED) {
        this.logger.warn(`User not verified: ${dto.email}`);
        throw new HttpException(
          'User is not verified. Please verify your email to proceed.',
          HttpStatus.FORBIDDEN,
        );
      }

      const isPasswordValid = await CodeUtil.checkPassword(
        dto.password,
        user.password,
      );
      if (!isPasswordValid) {
        this.logger.warn(`Invalid password for user: ${dto.email}`);
        throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
      }

      const { password, accessToken, ...result } = user.dataValues;
      this.logger.log(`User validated successfully: ${dto.email}`);
      return result;
    } catch (error) {
      this.logger.error(`Error validating user: ${dto.email}`, error.stack);
      throw error;
    }
  }

  async login(user: Partial<Users>): Promise<{ accessToken: string }> {
    this.logger.log(`Logging in user: ${user.email}`);
    try {
      const { id, firstName, lastName, email } = user;
      const accessToken = this.jwtService.sign({
        id,
        firstName,
        lastName,
        email,
      });

      const isUpdated = await this.usersService.updateTokenByUserId(
        id,
        accessToken,
      );
      if (!isUpdated) {
        this.logger.warn(`Failed to update access token for user ID: ${id}`);
        throw new Error(`Failed to update access token for user ID: ${id}`);
      }

      this.logger.log(`User logged in successfully: ${email}`);
      return { accessToken };
    } catch (error) {
      this.logger.error(
        `Error during login process for user: ${user.email}`,
        error.stack,
      );
      throw new Error('Login failed. Please try again later.');
    }
  }

  async register(dto: CreateUserDto): Promise<Partial<Users>> {
    this.logger.log(`Registering user with email: ${dto.email}`);
    try {
      const existingUser = await this.usersService.findByEmail(dto.email);

      if (existingUser) {
        this.logger.warn(
          `Registration failed: User with email ${dto.email} already exists`,
        );
        throw new HttpException(
          `A user with the email ${dto.email} already exists.`,
          HttpStatus.BAD_REQUEST,
        );
      }

      const user = await this.usersService.create(dto);
      await this.mailsService.sendEmailVerification(user);

      const { password, code, ...safeUser } = user.dataValues;
      this.logger.log(`User registered successfully: ${dto.email}`);
      return safeUser;
    } catch (error) {
      this.logger.error(`Error registering user: ${dto.email}`, error.stack);
      throw error;
    }
  }

  async verifyCode(email: string, code: string): Promise<Users> {
    this.logger.log(`Verifying code for user: ${email}`);
    try {
      const user = await this.usersService.findByEmail(email);

      if (!user) {
        this.logger.warn(`User not found for email: ${email}`);
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      if (user.status !== USER_STATUS.CREATED) {
        this.logger.warn(`Invalid status for user: ${email}`);
        throw new BadRequestException({ in: 'user status' });
      }

      if (user.code !== code) {
        this.logger.warn(`Code mismatch for user: ${email}`);
        throw new BadRequestException({ in: "code doesn't match" });
      }

      const updatedUser = await this.usersService.updateUserStatus(
        USER_STATUS.VERIFIED,
        user.email,
      );
      this.logger.log(
        `Code verified and user status updated to VERIFIED for: ${email}`,
      );
      return updatedUser;
    } catch (error) {
      this.logger.error(`Error verifying code for user: ${email}`, error.stack);
      throw error;
    }
  }
}
