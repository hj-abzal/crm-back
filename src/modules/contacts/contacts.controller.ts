import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { ContactsService } from './contacts.service';
import { Contacts } from './models/contacts.model';
import { UpdateContactDto } from './dto/update-contact.dto';
import { UpdatePhoneDto } from './dto/update-phone.dto';
import { ContactPhones } from './models/contact-phones.model';
import { DeletePhoneDto } from './dto/delete-phone.dto';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

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
