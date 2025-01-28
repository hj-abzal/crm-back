import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './create-user.dto';
import { EventPayload } from './user.interface';
import { Users } from './users.model';
import { AuthGuard, ExpressGuarded, Roles } from '../auth/guards/auth.guard';
import dayjs from 'dayjs';
import { USER_ROLE } from './user-role.enums';

@Controller('users')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private usersService: UsersService) {}

  @Get('')
  @UseGuards(AuthGuard)
  @Roles(USER_ROLE.ADMIN)
  async getAll(
    @Req() request: ExpressGuarded,
    @Query('lastUpdatedAt') lastUpdated?: string,
  ): Promise<EventPayload<Users[]>> {
    try {
      const users = await this.usersService.getAll(lastUpdated);
      return {
        lastUpdatedAt: dayjs().toISOString(),
        sourceUserId: request.user.userId,
        payload: users,
      };
    } catch (e) {
      throw new HttpException(
        'Error while fetching all users',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':userId')
  @UseGuards(AuthGuard)
  @Roles(USER_ROLE.ADMIN)
  async getOne(
    @Param('userId') userId: string,
    @Req() request: ExpressGuarded,
  ): Promise<EventPayload<Users>> {
    try {
      const user = await this.usersService.getOne(userId);
      return {
        lastUpdatedAt: dayjs().toISOString(),
        sourceUserId: request.user.userId,
        payload: user,
      };
    } catch (e) {
      throw new HttpException(
        'Error while fetching the user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('')
  @UseGuards(AuthGuard)
  @Roles(USER_ROLE.ADMIN)
  async register(
    @Body() dto: CreateUserDto,
    @Req() request: ExpressGuarded,
  ): Promise<EventPayload<Users>> {
    try {
      const sourceUserId = request.user.userId;
      const newUser = await this.usersService.create(dto, sourceUserId);
      return {
        lastUpdatedAt: dayjs().toISOString(),
        sourceUserId,
        payload: newUser,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error; // Rethrow already structured HttpException
      }
      this.logger.error(
        'Unexpected error while registering a user',
        error.stack || error.message,
      );

      // Throw a generic error message for unexpected errors
      throw new HttpException(
        'Error while creating a user. Please try again later.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // TODO: Dev only
  @Post('admin')
  async registerAdmin(@Body() dto: CreateUserDto): Promise<Users> {
    return this.usersService.createAdmin(dto);
  }

  @Put(':userId')
  @UseGuards(AuthGuard)
  @Roles(USER_ROLE.ADMIN)
  async updateOne(
    @Param('userId') userId: string,
    @Body() userDto: UpdateUserDto,
    @Req() request: ExpressGuarded,
  ): Promise<EventPayload<Users>> {
    try {
      const sourceUserId = request.user.userId;
      const updatedUser = await this.usersService.updateOne(
        userId,
        userDto,
        sourceUserId,
      );
      return {
        lastUpdatedAt: dayjs().toISOString(),
        payload: updatedUser,
        sourceUserId,
      };
    } catch (e) {
      throw new HttpException(
        'Error while updating the user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':userId')
  @UseGuards(AuthGuard)
  @Roles(USER_ROLE.ADMIN)
  async deleteOne(
    @Param('userId') userId: string,
    @Req() request: ExpressGuarded,
  ): Promise<EventPayload<null>> {
    try {
      const sourceUserId = request.user.userId;
      await this.usersService.deleteOne(userId, sourceUserId);
      return {
        lastUpdatedAt: dayjs().toISOString(),
        sourceUserId,
        payload: null,
      };
    } catch (e) {
      throw new HttpException(
        'Error while deleting the user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
