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
} from '@nestjs/common';
import { ContactSourcesService } from './contact-sources.service';
import { ContactSources } from './contact-source.model';
import { USER_ROLE } from '../users/user-role.enums';
import { AuthGuard, Roles } from '../auth/guards/auth.guard';

@Controller('sources')
export class ContactSourcesController {
  constructor(private readonly contactSourcesService: ContactSourcesService) {}

  @Post()
  @UseGuards(AuthGuard)
  @Roles(USER_ROLE.ADMIN)
  async createSource(@Body('name') name: string): Promise<ContactSources> {
    try {
      return await this.contactSourcesService.createSource(name);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
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
  ): Promise<{ lastUpdatedAt: string | null; payload: ContactSources[] }> {
    try {
      return await this.contactSourcesService.getAllSources(lastUpdated);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
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
  ): Promise<ContactSources> {
    try {
      return await this.contactSourcesService.updateSource(sourceId, name);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
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
  ): Promise<null> {
    try {
      await this.contactSourcesService.deleteSource(sourceId);
      return null;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error while deleting source. Please try again later.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
