import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './create-user.dto';
import { AuthGuard, Role } from '../auth/guards/auth.guard';
import { USER_ROLE } from './user-role.enums';

@Controller('users')
export class UserController {
  constructor(private usersService: UsersService) {}

  @Get('')
  @UseGuards(AuthGuard)
  @Role(USER_ROLE.ADMIN)
  async getAll() {
    return this.usersService.getAll();
  }

  @Get(':userId')
  @UseGuards(AuthGuard)
  @Role(USER_ROLE.ADMIN)
  async getOne(@Param('userId') userId: string) {
    return this.usersService.getOne(userId);
  }

  @Post('')
  // @UseGuards(AuthGuard)
  // @Role(USER_ROLE.ADMIN)
  async register(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Put(':userId')
  @UseGuards(AuthGuard)
  @Role(USER_ROLE.ADMIN)
  async updateOne(
    @Param('userId') userId: string,
    @Body() userDto: UpdateUserDto,
  ) {
    return this.usersService.updateOne(userId, userDto);
  }

  @Delete(':userId')
  @UseGuards(AuthGuard)
  @Role(USER_ROLE.ADMIN)
  async deleteOne(@Param('userId') userId: string) {
    return this.usersService.deleteOne(userId);
  }
}
