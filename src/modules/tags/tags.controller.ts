import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Put,
  Param,
  ParseIntPipe,
  Delete,
  Query,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { TagsService } from './tags.service';
import { Tags } from './tags.model';
import { USER_ROLE } from '../users/user-role.enums';
import { AuthGuard, Roles } from '../auth/guards/auth.guard';

@Controller('tags')
export class TagsController {
  private readonly logger = new Logger(TagsController.name);

  constructor(private readonly tagsService: TagsService) {}

  @Post()
  @UseGuards(AuthGuard)
  @Roles(USER_ROLE.ADMIN)
  async createTag(@Body('name') name: string): Promise<Tags> {
    try {
      return await this.tagsService.createTag(name);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(
        'Unexpected error while creating tag',
        error.stack || error.message,
      );

      throw new HttpException(
        'Error while creating tag. Please try again later.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @UseGuards(AuthGuard)
  async getAllTags(
    @Query('lastUpdatedAt') lastUpdated?: string,
  ): Promise<{ lastUpdatedAt: string | null; payload: Tags[] }> {
    try {
      return await this.tagsService.getAllTags(lastUpdated);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(
        'Unexpected error while fetching tags',
        error.stack || error.message,
      );

      throw new HttpException(
        'Error while fetching tags. Please try again later.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':tagId')
  @UseGuards(AuthGuard)
  @Roles(USER_ROLE.ADMIN)
  async updateTag(
    @Param('tagId', ParseIntPipe) tagId: number,
    @Body('name') name: string,
  ): Promise<Tags> {
    try {
      return await this.tagsService.updateTag(tagId, name);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(
        'Unexpected error while updating tag',
        error.stack || error.message,
      );

      throw new HttpException(
        'Error while updating tag. Please try again later.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':tagId')
  @UseGuards(AuthGuard)
  @Roles(USER_ROLE.ADMIN)
  async deleteTag(@Param('tagId', ParseIntPipe) tagId: number): Promise<null> {
    try {
      await this.tagsService.deleteTag(tagId);
      return null;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(
        'Unexpected error while deleting tag',
        error.stack || error.message,
      );

      throw new HttpException(
        'Error while deleting tag. Please try again later.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
