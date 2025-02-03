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
  Patch,
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
import { UpdatePhoneDto } from './dto/update-phone.dto';
import { ContactPhones } from './models/contact-phones.model';
import { DeletePhoneDto } from './dto/delete-phone.dto';
import { AuthGuard, ExpressGuarded } from '../auth/guards/auth.guard';
import dayjs from 'dayjs';
import { USER_ROLE } from '../users/user-role.enums';
import { Op } from 'sequelize';

@Controller('contacts')
export class ContactsController {
  private readonly logger = new Logger(ContactsController.name);

  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  @UseGuards(AuthGuard)
  async getAllContacts(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('lastUpdatedAt') lastUpdatedAt: Date,
    @Query('managerId') managerId: number,
    @Req() req: ExpressGuarded,
  ) {
    try {
      const contacts = await this.contactsService.getAll(
        page || 1,
        limit || 300,
        lastUpdatedAt,
        req.user.role === USER_ROLE.ADMIN ? managerId : req.user.userId,
      );

      return {
        lastUpdatedAt: dayjs().toISOString(),
        payload: contacts,
      };
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

  @Post(':contactId/tags')
  @UseGuards(AuthGuard)
  async addTagsToContact(
    @Param('contactId') contactId: number,
    @Body('tagIds') tagIds: number[],
  ) {
    return this.contactsService.addTagsToContact(contactId, tagIds);
  }

  @Put(':contactId')
  @UseGuards(AuthGuard)
  async updateContact(
    @Param('contactId', ParseIntPipe) contactId: number,
    @Body() updateContactDto: UpdateContactDto,
  ): Promise<Contacts> {
    return this.contactsService.updateContact(contactId, updateContactDto);
  }

  @Patch(':contactId/phones')
  @UseGuards(AuthGuard)
  async updatePhones(
    @Param('contactId', ParseIntPipe) contactId: number,
    @Body() phones: UpdatePhoneDto[],
  ): Promise<ContactPhones[]> {
    return this.contactsService.updateContactPhones(contactId, phones);
  }

  @Delete(':contactId/phones')
  @UseGuards(AuthGuard)
  async deletePhones(
    @Param('contactId', ParseIntPipe) contactId: number,
    @Body() deletePhoneDto: DeletePhoneDto,
  ): Promise<{ message: string }> {
    const { phoneIds } = deletePhoneDto;
    await this.contactsService.deleteContactPhones(contactId, phoneIds);
    return { message: 'Phone numbers deleted successfully' };
  }

  @Delete(':contactId')
  @UseGuards(AuthGuard)
  async deleteContact(
    @Param('contactId', ParseIntPipe) contactId: number,
  ): Promise<{ message: string }> {
    return this.contactsService.deleteContact(contactId);
  }
}
