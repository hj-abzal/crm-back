import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { ContactsService } from './contacts.service';
import { Contacts } from './models/contacts.model';
import { UpdateContactDto } from './dto/update-contact.dto';
import { AuthGuard, ExpressGuarded } from '../auth/guards/auth.guard';
import { USER_ROLE } from '../users/user-role.enums';

@Controller('contacts')
export class ContactsController {
  private readonly logger = new Logger(ContactsController.name);

  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  @UseGuards(AuthGuard)
  async getAllContacts(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('lastUpdatedAt') lastUpdatedAt: string,
    @Query('managerId') managerId: number,
    @Req() req: ExpressGuarded,
  ) {
    try {
      return await this.contactsService.getAll(
        page || 1,
        limit || 1000,
        lastUpdatedAt,
        req.user.role === USER_ROLE.ADMIN ? managerId : req.user.userId,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(
        'Unexpected error while fetching contacts',
        error.stack || error.message,
      );

      throw new HttpException(
        'Error while fetching all contacts. Please try again later.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  @UseGuards(AuthGuard)
  async createContact(@Body() createContactDto: CreateContactDto) {
    return this.contactsService.createContact(createContactDto);
  }

  @Get(':contactId')
  @UseGuards(AuthGuard)
  async getContact(@Param('contactId') contactId: string) {
    return this.contactsService.getOne(+contactId);
  }

  @Put(':contactId')
  @UseGuards(AuthGuard)
  async updateContact(
    @Param('contactId', ParseIntPipe) contactId: number,
    @Body() updateContactDto: UpdateContactDto,
  ): Promise<Contacts> {
    return this.contactsService.updateContact(contactId, updateContactDto);
  }

  @Delete(':contactId')
  @UseGuards(AuthGuard)
  async deleteContact(
    @Param('contactId', ParseIntPipe) contactId: number,
  ): Promise<void> {
    return this.contactsService.deleteContact(contactId);
  }
}
