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
} from '@nestjs/common';
import { ContactStatusService } from './contact-status.service';
import { ContactStatuses } from './contact-status.model';
import { USER_ROLE } from '../users/user-role.enums';
import { Roles } from '../auth/guards/auth.guard';

@Controller('sources')
export class ContactStatusController {
  constructor(private readonly contactStatusService: ContactStatusService) {}

  @Post()
  @UseGuards()
  @Roles(USER_ROLE.ADMIN)
  async createStatus(@Body('name') name: string): Promise<ContactStatuses> {
    return this.contactStatusService.createStatus(name);
  }

  @Get()
  @UseGuards()
  @Roles(USER_ROLE.ADMIN)
  async getAllStatuses(): Promise<ContactStatuses[]> {
    return this.contactStatusService.getAllStatuses();
  }

  @Put(':statusId')
  @UseGuards()
  @Roles(USER_ROLE.ADMIN)
  async updateStatus(
    @Param('statusId', ParseIntPipe) statusId: number,
    @Body('name') name: string,
  ): Promise<ContactStatuses> {
    return this.contactStatusService.updateStatus(statusId, name);
  }

  @Delete(':statusId')
  @UseGuards()
  @Roles(USER_ROLE.ADMIN)
  async deleteStatus(
    @Param('statusId', ParseIntPipe) statusId: number,
  ): Promise<{ message: string }> {
    return this.contactStatusService.deleteStatus(statusId);
  }
}
