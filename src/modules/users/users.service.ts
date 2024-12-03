import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Users } from './users.model';
import { CodeUtil } from '../../utils/code.util';
import { USER_STATUS } from './user-status.enums';
import { CreateUserDto } from './create-user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(Users) private readonly usersRepository: typeof Users,
  ) {}

  async findByEmail(email: string): Promise<Users | undefined> {
    this.logger.log(`Fetching user by email: ${email}`);
    try {
      return await this.usersRepository.findOne({ where: { email } });
    } catch (error) {
      this.logger.error(`Failed to fetch user by email: ${email}`, error.stack);
      throw new Error('Failed to find user');
    }
  }

  async updateTokenByUserId(id: number, accessToken: string): Promise<boolean> {
    this.logger.log(`Updating access token for user with ID: ${id}`);
    try {
      const [affectedCount] = await this.usersRepository.update(
        { accessToken },
        { where: { id } },
      );
      const success = affectedCount === 1;
      if (success) {
        this.logger.log(`Successfully updated access token for user ID: ${id}`);
      } else {
        this.logger.warn(`No user found to update token for ID: ${id}`);
      }
      return success;
    } catch (error) {
      this.logger.error(
        `Error updating token for user with ID: ${id}`,
        error.stack,
      );
      throw new Error('Failed to update access token');
    }
  }

  async create(userDto: CreateUserDto): Promise<Users> {
    const code = CodeUtil.generateRandomCode(6);
    this.logger.log(
      `Creating user with email: ${userDto.email} and generated code: ${code}`,
    );
    try {
      const user = {
        firstName: userDto.firstName,
        lastName: userDto.lastName,
        email: userDto.email,
        password: await CodeUtil.encryptPassword(userDto.password),
      };

      const newUser = await this.usersRepository.create({
        ...user,
        code,
        status: USER_STATUS.CREATED,
      });
      this.logger.log(`Successfully created user with ID: ${newUser.id}`);
      return newUser;
    } catch (error) {
      this.logger.error(
        `Error creating user with email: ${userDto.email}`,
        error.stack,
      );
      throw new Error('Failed to create user');
    }
  }

  async updateUserStatus(status: USER_STATUS, email: string): Promise<Users> {
    this.logger.log(
      `Updating status to '${status}' for user with email: ${email}`,
    );
    try {
      const [affectedCount] = await this.usersRepository.update(
        { status, code: null }, // Clear code after status update
        { where: { email } },
      );

      if (affectedCount === 1) {
        this.logger.log(
          `Successfully updated status for user with email: ${email}`,
        );
        return await this.findByEmail(email);
      } else {
        this.logger.warn(`No user found to update status for email: ${email}`);
        throw new Error('Failed to update status');
      }
    } catch (error) {
      this.logger.error(
        `Error updating status for user with email: ${email}`,
        error.stack,
      );
      throw new Error('Failed to update user status');
    }
  }
}
