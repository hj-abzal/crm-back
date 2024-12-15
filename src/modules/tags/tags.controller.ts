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
} from '@nestjs/common';
import { TagsService } from './tags.service';
import { Tags } from './tags.model';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  @UseGuards(AuthGuard)
  async createTag(@Body('name') name: string): Promise<Tags> {
    return this.tagsService.createTag(name);
  }

  @Get()
  @UseGuards(AuthGuard)
  async getAllTags(): Promise<Tags[]> {
    return this.tagsService.getAllTags();
  }

  @Put(':tagId')
  @UseGuards(AuthGuard)
  async updateTag(
    @Param('tagId', ParseIntPipe) tagId: number,
    @Body('name') name: string,
  ): Promise<Tags> {
    return this.tagsService.updateTag(tagId, name);
  }

  @Delete(':tagId')
  @UseGuards(AuthGuard)
  async deleteTag(
    @Param('tagId', ParseIntPipe) tagId: number,
  ): Promise<{ message: string }> {
    return this.tagsService.deleteTag(tagId);
  }
}
