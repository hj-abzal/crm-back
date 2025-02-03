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
import { ContactSourcesService } from './contact-sources.service';
import { ContactSources } from './contact-source.model';
import { USER_ROLE } from '../users/user-role.enums';
import { AuthGuard, Roles } from '../auth/guards/auth.guard';
import { EventPayload } from '../users/user.interface';
import dayjs from 'dayjs';

@Controller('sources')
export class ContactSourcesController {
  private readonly logger = new Logger(ContactSourcesController.name);

  constructor(private readonly contactSourcesService: ContactSourcesService) {}

  @Post()
  @UseGuards(AuthGuard)
  @Roles(USER_ROLE.ADMIN)
  async createSource(
    @Body('name') name: string,
  ): Promise<EventPayload<ContactSources>> {
    try {
      const source = await this.contactSourcesService.createSource(name);
      return {
        lastUpdatedAt: dayjs().toISOString(),
        payload: source,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(
        'Unexpected error while creating source',
        error.stack || error.message,
      );

      throw new HttpException(
        'Error while creating source. Please try again later.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @UseGuards(AuthGuard)
  async getAllSources(
    @Query('lastUpdatedAt') lastUpdated?: string,
  ): Promise<EventPayload<ContactSources[]>> {
    try {
      const sources = await this.contactSourcesService.getAllSources(
        lastUpdated,
      );
      return {
        lastUpdatedAt: dayjs().toISOString(),
        payload: sources,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(
        'Unexpected error while fetching sources',
        error.stack || error.message,
      );

      throw new HttpException(
        'Error while fetching sources. Please try again later.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':sourceId')
  @UseGuards(AuthGuard)
  @Roles(USER_ROLE.ADMIN)
  async updateSource(
    @Param('sourceId', ParseIntPipe) sourceId: number,
    @Body('name') name: string,
  ): Promise<EventPayload<ContactSources>> {
    try {
      const source = await this.contactSourcesService.updateSource(
        sourceId,
        name,
      );
      return {
        lastUpdatedAt: dayjs().toISOString(),
        payload: source,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(
        'Unexpected error while updating source',
        error.stack || error.message,
      );

      throw new HttpException(
        'Error while updating source. Please try again later.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':sourceId')
  @UseGuards(AuthGuard)
  @Roles(USER_ROLE.ADMIN)
  async deleteSource(
    @Param('sourceId', ParseIntPipe) sourceId: number,
  ): Promise<EventPayload<null>> {
    try {
      await this.contactSourcesService.deleteSource(sourceId);
      return {
        lastUpdatedAt: dayjs().toISOString(),
        payload: null,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(
        'Unexpected error while deleting source',
        error.stack || error.message,
      );

      throw new HttpException(
        'Error while deleting source. Please try again later.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
