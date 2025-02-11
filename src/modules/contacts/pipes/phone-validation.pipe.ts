import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { CreateContactDto } from '../dto/create-contact.dto';
import { ContactPhones } from '../models/contact-phones.model';
import { PHONE_ERROR_MESSAGES } from '../constants/error-messages';

@Injectable()
export class PhoneValidationPipe implements PipeTransform {
  async transform(value: CreateContactDto) {
    if (!value.contactPhones?.length) {
      return value;
    }

    // Check for duplicates within the request
    const phoneNumbers = value.contactPhones.map(phone => phone.phoneNumber);
    const uniquePhones = new Set(phoneNumbers);
    if (uniquePhones.size !== phoneNumbers.length) {
      throw new BadRequestException(PHONE_ERROR_MESSAGES.DUPLICATE_IN_REQUEST);
    }

    // Check if phone numbers already exist in database
    for (const phone of phoneNumbers) {
      const existingPhone = await ContactPhones.findOne({
        where: { phoneNumber: phone },
      });

      if (existingPhone) {
        throw new BadRequestException(PHONE_ERROR_MESSAGES.ALREADY_EXISTS(phone));
      }
    }

    return value;
  }
} 