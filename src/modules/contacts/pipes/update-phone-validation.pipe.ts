import { PipeTransform, Injectable, BadRequestException, ArgumentMetadata, Inject, Scope } from '@nestjs/common';
import { UpdateContactDto } from '../dto/update-contact.dto';
import { ContactPhones } from '../models/contact-phones.model';
import { Op } from 'sequelize';
import { PHONE_ERROR_MESSAGES } from '../constants/error-messages';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Injectable({ scope: Scope.REQUEST })
export class UpdatePhoneValidationPipe implements PipeTransform<UpdateContactDto> {
  constructor(@Inject(REQUEST) private readonly request: Request) {}

  async transform(value: UpdateContactDto, metadata: ArgumentMetadata) {
    if (!value.phones?.length) {
      return value;
    }

    const contactId = parseInt(this.request.params.contactId);

    // Check for duplicates within the request
    const phoneNumbers = value.phones.map(phone => phone.phoneNumber);
    const uniquePhones = new Set(phoneNumbers);
    if (uniquePhones.size !== phoneNumbers.length) {
      throw new BadRequestException(PHONE_ERROR_MESSAGES.DUPLICATE_IN_REQUEST);
    }

    // Check if phone numbers already exist in database (excluding current contact's phones)
    for (const phone of phoneNumbers) {
      const existingPhone = await ContactPhones.findOne({
        where: { 
          phoneNumber: phone,
          contactId: { [Op.ne]: contactId } // Exclude current contact's phones
        },
      });

      console.log(existingPhone?.contactId);

      if (existingPhone) {
        throw new BadRequestException(PHONE_ERROR_MESSAGES.ALREADY_EXISTS_OTHER(phone));
      }
    }

    return value;
  }
} 