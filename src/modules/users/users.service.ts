import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Users } from './users.model';
import { USER_ROLE } from './user-role.enums';
import { CreateUserDto, UpdateUserDto } from './create-user.dto';
import { CodeUtil } from '../../utils/code.util';
import { AppGateway } from '../../gateway/app.gateway';
import dayjs from 'dayjs';
import { Op } from 'sequelize';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(Users) private readonly usersRepository: typeof Users,
    private readonly appGateway: AppGateway,
  ) {}

  async findByUsername(username: string): Promise<Users | undefined> {
    this.logger.log(`Fetching user by username: ${username}`);
    try {
      return await this.usersRepository.findOne({
        where: { username },
        paranoid: false,
      });
    } catch (error) {
      this.logger.error(`Failed to fetch user by username: ${username}`, error);
      throw new Error('Failed to find user');
    }
  }

  async create(userDto: CreateUserDto): Promise<Users> {
    this.logger.log(`Creating user with username: ${userDto.username}`);

    const existingUser = await this.findByUsername(userDto.username);
    if (existingUser) {
      this.logger.warn(
        `Registration failed: User with username ${userDto.username} already exists`,
      );
      throw new HttpException(
        `A user with the email ${userDto.username} already exists.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const user = {
        username: userDto.username,
        firstName: userDto.firstName,
        lastName: userDto.lastName,
        password: await CodeUtil.encryptPassword(userDto.password),
        role: userDto.role ? userDto.role : USER_ROLE.MANAGER,
      };

      const createdUser = await this.usersRepository.create(user);
      this.logger.log(`Successfully created user with ID: ${createdUser.userId}`);

      // Emit user_created event
      this.appGateway.server.emit('user_created', {
        payload: createdUser,
        lastUpdatedAt: dayjs().toISOString(),
      });

      return createdUser;
    } catch (error) {
      this.logger.error(
        `Error creating user with username: ${userDto.username}`,
        error,
      );
      throw new Error('Failed to create user');
    }
  }

  async getAll(lastUpdated: string): Promise<Users[]> {
    try {
      this.logger.log(
        `Requesting to get all users, lastUpdated: ${
          lastUpdated || 'not provided'
        }`,
      );

      if (lastUpdated) {
        const whereClause = lastUpdated
          ? {
              [Op.or]: [
                { updatedAt: { [Op.gte]: new Date(lastUpdated) } },
                { deletedAt: { [Op.gte]: new Date(lastUpdated) } },
              ],
            }
          : {};

        return await this.usersRepository.findAll({
          where: whereClause,
          paranoid: false,
        });
      }

      return await this.usersRepository.findAll();
    } catch (error) {
      this.logger.error(`Error getting all users`, error);
      throw new Error('Failed to get users');
    }
  }

  async getOne(userId: string): Promise<Users | undefined> {
    try {
      this.logger.log(`Fetching user with userId: ${userId}`);
      return this.usersRepository.findOne({
        where: { userId },
        // include: [{ model: Contacts }],
      });
    } catch (error) {
      this.logger.error(`Error fetching user by userId: ${userId}`, error);
      throw new Error('Failed to get user');
    }
  }

  async updateOne(userId: string, userDto: UpdateUserDto): Promise<Users> {
    try {
      this.logger.log(`Updating user with userId: ${userId}`);

      const user: UpdateUserDto = {
        username: userDto.username,
        firstName: userDto.firstName,
        lastName: userDto.lastName,
        role: userDto.role,
      };

      if (userDto.password) {
        user.password = await CodeUtil.encryptPassword(userDto.password);
      }

      const [affectedCount] = await this.usersRepository.update(
        { ...user },
        { where: { userId } },
      );

      if (affectedCount !== 1) {
        this.logger.warn(`No user found to update for userId: ${userId}`);
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const updatedUser = await this.usersRepository.findByPk(userId);
      this.logger.log(`Successfully updated user with userId: ${userId}`);

      // Emit user_updated event
      this.appGateway.server.emit('user_updated', {
        payload: updatedUser,
        lastUpdatedAt: dayjs().toISOString(),
      });

      return updatedUser;
    } catch (error) {
      this.logger.error(`Error updating userId: ${userId}`, error);
      throw new Error('Failed to update user');
    }
  }

  async deleteOne(userId: string): Promise<void> {
    try {
      this.logger.log(`Attempting to delete user with userId: ${userId}`);

      const deletedCount = await this.usersRepository.destroy({
        where: { userId },
      });
      if (deletedCount === 0) {
        this.logger.warn(`No user found to delete with userId: ${userId}`);
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      this.logger.log(`Successfully deleted user with userId: ${userId}`);

      // Emit user_deleted event
      this.appGateway.server.emit('user_deleted', {
        payload: { userId: +userId },
        lastUpdatedAt: dayjs().toISOString(),
      });
    } catch (error) {
      this.logger.error(`Error deleting userId: ${userId}`, error);
      throw new Error('Failed to delete user');
    }
  }

  //DEV only
  async createAdmin(userDto: CreateUserDto): Promise<Users> {
    const existingUser = await this.findByUsername(userDto.username);

    if (existingUser) {
      throw new HttpException(
        'A user with the email ${userDto.username} already exists.',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const user = {
        username: userDto.username,
        firstName: userDto.firstName,
        lastName: userDto.lastName,
        password: await CodeUtil.encryptPassword(userDto.password),
        role: USER_ROLE.ADMIN,
      };

      return this.usersRepository.create(user);
    } catch (error) {
      throw new Error('Failed to create user');
    }
  }
}
