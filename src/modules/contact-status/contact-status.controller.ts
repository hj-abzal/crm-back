import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Query,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ContactStatusService } from './contact-status.service';
import { ContactStatuses } from './contact-status.model';
import { USER_ROLE } from '../users/user-role.enums';
import { AuthGuard, Roles } from '../auth/guards/auth.guard';

@Controller('statuses')
export class ContactStatusController {
  private readonly logger = new Logger(ContactStatusController.name);

  constructor(private readonly contactStatusService: ContactStatusService) {}

  @Post()
  @UseGuards(AuthGuard)
  @Roles(USER_ROLE.ADMIN)
  async createStatus(@Body('name') name: string): Promise<ContactStatuses> {
    try {
      return await this.contactStatusService.createStatus(name);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(
        'Unexpected error while creating status',
        error.stack || error.message,
      );

      throw new HttpException(
        'Error while creating status. Please try again later.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @UseGuards(AuthGuard)
  async getAllStatuses(
    @Query('lastUpdatedAt') lastUpdated?: string,
  ): Promise<{ lastUpdatedAt: string | null; payload: ContactStatuses[] }> {
    try {
      return await this.contactStatusService.getAllStatuses(lastUpdated);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(
        'Unexpected error while fetching statuses',
        error.stack || error.message,
      );

      throw new HttpException(
        'Error while fetching statuses. Please try again later.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':statusId')
  @UseGuards(AuthGuard)
  @Roles(USER_ROLE.ADMIN)
  async updateStatus(
    @Param('statusId', ParseIntPipe) statusId: number,
    @Body('name') name: string,
  ): Promise<ContactStatuses> {
    try {
      return await this.contactStatusService.updateStatus(statusId, name);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(
        'Unexpected error while updating status',
        error.stack || error.message,
      );

      throw new HttpException(
        'Error while updating status. Please try again later.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':statusId')
  @UseGuards(AuthGuard)
  @Roles(USER_ROLE.ADMIN)
  async deleteStatus(
    @Param('statusId', ParseIntPipe) statusId: number,
  ): Promise<null> {
    try {
      await this.contactStatusService.deleteStatus(statusId);
      return null;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(
        'Unexpected error while deleting status',
        error.stack || error.message,
      );

      throw new HttpException(
        'Error while deleting status. Please try again later.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
