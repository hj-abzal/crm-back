import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Users } from './users.model';
import { USER_ROLE } from './user-role.enums';
import { CreateUserDto, UpdateUserDto } from './create-user.dto';
import { CodeUtil } from '../../utils/code.util';
import { Contacts } from '../contacts/models/contacts.model';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(Users) private readonly usersRepository: typeof Users,
  ) {}

  async findByUsername(username: string): Promise<Users | undefined> {
    this.logger.log(`Fetching user by username: ${username}`);
    try {
      return await this.usersRepository.findOne({ where: { username } });
    } catch (error) {
      this.logger.error(`Failed to fetch user by username: ${username}`, error);
      throw new Error('Failed to find user');
    }
  }

  async updateTokenByUserId(
    userId: number,
    accessToken: string,
  ): Promise<boolean> {
    this.logger.log(`Updating access token for user with userId: ${userId}`);
    try {
      const [affectedCount] = await this.usersRepository.update(
        { accessToken },
        { where: { userId } },
      );
      const success = affectedCount === 1;
      if (success) {
        this.logger.log(
          `Successfully updated access token for userId: ${userId}`,
        );
      } else {
        this.logger.warn(`No user found to update token for userId: ${userId}`);
      }
      return success;
    } catch (error) {
      this.logger.error(
        `Error updating token for user with userId: ${userId}`,
        error,
      );
      throw new Error('Failed to update access token');
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
        role: USER_ROLE.MANAGER,
      };

      const createdUser = await this.usersRepository.create(user);
      this.logger.log(`Successfully created user with ID: ${createdUser.id}`);
      return createdUser;
    } catch (error) {
      this.logger.error(
        `Error creating user with username: ${userDto.username}`,
        error,
      );
      throw new Error('Failed to create user');
    }
  }

  //TODO: dev only
  async createAdmin(userDto: CreateUserDto): Promise<Users> {
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
        role: USER_ROLE.ADMIN,
      };

      const createdUser = await this.usersRepository.create(user);
      this.logger.log(`Successfully created user with ID: ${createdUser.id}`);
      return createdUser;
    } catch (error) {
      this.logger.error(
        `Error creating user with username: ${userDto.username}`,
        error,
      );
      throw new Error('Failed to create user');
    }
  }

  async getAll(): Promise<Users[]> {
    try {
      this.logger.log(`Requesting to get all managers`);
      return this.usersRepository.findAll({
        where: { role: USER_ROLE.MANAGER },
      });
    } catch (error) {
      this.logger.error(`Error getting all users`, error);
      throw new Error('Failed to create user');
    }
  }

  async getOne(userId: string): Promise<Users | undefined> {
    try {
      this.logger.log(`Requesting to get managers by userId:` + userId);
      return this.usersRepository.findOne({
        where: { userId },
        include: [
          {
            model: Contacts,
          },
        ],
      });
    } catch (error) {
      this.logger.error(`Error getting manager by userId: ${userId}, `, error);
      throw new Error('Failed to get user');
    }
  }

  async updateOne(userId: string, userDto: UpdateUserDto): Promise<Users> {
    try {
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
        {
          where: { userId },
        },
      );

      const success = affectedCount === 1;
      if (success) {
        this.logger.log(`Successfully updated for userId: ${userId}`);
      } else {
        this.logger.warn(`No user found to update for userId: ${userId}`);
      }
      return await this.usersRepository.findByPk(userId);
    } catch (error) {
      this.logger.error(`Error updating userId `, userId, error);
      throw new Error('Failed to update user');
    }
  }

  async deleteOne(userId: string): Promise<HttpStatus> {
    try {
      this.logger.log(`Trying delete userId: ${userId}`);
      const deletedCount = await this.usersRepository.destroy({
        where: { userId },
      });
      if (deletedCount) {
        this.logger.log(`Successfully deleted userId: ${userId}`);
        return HttpStatus.OK;
      } else {
        this.logger.log(`No user found to delete userId: ${userId}`);
        return HttpStatus.NOT_FOUND;
      }
    } catch (error) {
      this.logger.error(`Error deleting userId `, userId, error);
      throw new Error('Failed to delete user');
    }
  }
}
