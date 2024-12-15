import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { ContactSourcesService } from './contact-sources.service';
import { ContactSources } from './contact-source.model';

@Controller('sources')
export class ContactSourcesController {
  constructor(private readonly contactSourcesService: ContactSourcesService) {}

  @Post()
  async createSource(@Body('name') name: string): Promise<ContactSources> {
    return this.contactSourcesService.createSource(name);
  }

  @Get()
  async getAllSources(): Promise<ContactSources[]> {
    return this.contactSourcesService.getAllSources();
  }

  @Put(':sourceId')
  async updateSource(
    @Param('sourceId', ParseIntPipe) sourceId: number,
    @Body('name') name: string,
  ): Promise<ContactSources> {
    return this.contactSourcesService.updateSource(sourceId, name);
  }

  @Delete(':sourceId')
  async deleteSources(
    @Param('sourceId', ParseIntPipe) sourceId: number,
  ): Promise<{ message: string }> {
    return this.contactSourcesService.deleteSource(sourceId);
  }
}
