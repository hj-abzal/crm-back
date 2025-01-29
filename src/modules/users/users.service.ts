import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Users } from './users.model';
import { USER_ROLE } from './user-role.enums';
import { CreateUserDto, UpdateUserDto } from './create-user.dto';
import { CodeUtil } from '../../utils/code.util';
import { Contacts } from '../contacts/models/contacts.model';
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

  async create(userDto: CreateUserDto, sourceDeviceId: string): Promise<Users> {
    this.logger.log(
      `Creating user with username: ${userDto.username}, deviceId: ${sourceDeviceId}`,
    );

    const existingUser = await this.findByUsername(userDto.username);
    if (existingUser) {
      this.logger.warn(
        `Registration failed: User with username ${userDto.username} already exists, deviceId: ${sourceDeviceId}`,
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
        role: USER_ROLE.MANAGER,
      };

      const createdUser = await this.usersRepository.create(user);
      this.logger.log(
        `Successfully created user with ID: ${createdUser.id}, deviceId: ${sourceDeviceId}`,
      );

      // Emit user_created event
      this.appGateway.server.emit('user_created', {
        payload: createdUser,
        sourceDeviceId,
        lastUpdatedAt: dayjs().toISOString(),
      });

      return createdUser;
    } catch (error) {
      this.logger.error(
        `Error creating user with username: ${userDto.username}, deviceId: ${sourceDeviceId}`,
        error,
      );
      throw new Error('Failed to create user');
    }
  }

  async getAll(lastUpdated: string, sourceDeviceId: string): Promise<Users[]> {
    try {
      this.logger.log(
        `Requesting to get all users, lastUpdated: ${
          lastUpdated || 'not provided'
        }, deviceId: ${sourceDeviceId}`,
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
      this.logger.error(
        `Error getting all users, deviceId: ${sourceDeviceId}`,
        error,
      );
      throw new Error('Failed to get users');
    }
  }

  async getOne(
    userId: string,
    sourceDeviceId: string,
  ): Promise<Users | undefined> {
    try {
      this.logger.log(
        `Fetching user with userId: ${userId}, deviceId: ${sourceDeviceId}`,
      );
      return this.usersRepository.findOne({
        where: { userId },
        include: [{ model: Contacts }],
      });
    } catch (error) {
      this.logger.error(
        `Error fetching user by userId: ${userId}, deviceId: ${sourceDeviceId}`,
        error,
      );
      throw new Error('Failed to get user');
    }
  }

  async updateOne(
    userId: string,
    userDto: UpdateUserDto,
    sourceDeviceId: string,
  ): Promise<Users> {
    try {
      this.logger.log(
        `Updating user with userId: ${userId}, deviceId: ${sourceDeviceId}`,
      );

      const user: UpdateUserDto = {
        username: userDto.username,
        firstName: userDto.firstName,
        lastName: userDto.lastName,
      };

      if (userDto.password) {
        user.password = await CodeUtil.encryptPassword(userDto.password);
      }

      const [affectedCount] = await this.usersRepository.update(
        { ...user },
        { where: { userId } },
      );

      if (affectedCount !== 1) {
        this.logger.warn(
          `No user found to update for userId: ${userId}, deviceId: ${sourceDeviceId}`,
        );
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const updatedUser = await this.usersRepository.findByPk(userId);
      this.logger.log(
        `Successfully updated user with userId: ${userId}, deviceId: ${sourceDeviceId}`,
      );

      // Emit user_updated event
      this.appGateway.server.emit('user_updated', {
        payload: updatedUser,
        sourceDeviceId,
        lastUpdatedAt: dayjs().toISOString(),
      });

      return updatedUser;
    } catch (error) {
      this.logger.error(
        `Error updating userId: ${userId}, deviceId: ${sourceDeviceId}`,
        error,
      );
      throw new Error('Failed to update user');
    }
  }

  async deleteOne(userId: string, sourceDeviceId: string): Promise<void> {
    try {
      this.logger.log(
        `Attempting to delete user with userId: ${userId}, deviceId: ${sourceDeviceId}`,
      );

      const deletedCount = await this.usersRepository.destroy({
        where: { userId },
      });
      if (deletedCount === 0) {
        this.logger.warn(
          `No user found to delete with userId: ${userId}, deviceId: ${sourceDeviceId}`,
        );
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      this.logger.log(
        `Successfully deleted user with userId: ${userId}, deviceId: ${sourceDeviceId}`,
      );

      // Emit user_deleted event
      this.appGateway.server.emit('user_deleted', {
        payload: { userId: +userId },
        sourceDeviceId,
        lastUpdatedAt: dayjs().toISOString(),
      });
    } catch (error) {
      this.logger.error(
        `Error deleting userId: ${userId}, deviceId: ${sourceDeviceId}`,
        error,
      );
      throw new Error('Failed to delete user');
    }
  }
}
