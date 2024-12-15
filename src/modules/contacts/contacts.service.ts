import { Injectable, NotFoundException } from '@nestjs/common';
import { Contacts } from './models/contacts.model';
import { ContactPhones } from './models/contact-phones.model';
import { InjectModel } from '@nestjs/sequelize';
import { Users } from '../users/users.model';
import { CreateContactDto } from './dto/create-contact.dto';
import { Tags } from '../tags/tags.model';
import { UpdateContactDto } from './dto/update-contact.dto';
import { UpdatePhoneDto } from './dto/update-phone.dto';
import { Cities } from '../cities/cities.model';
import { ContactSources } from '../contact-source/contact-source.model';

@Injectable()
export class ContactsService {
  constructor(
    @InjectModel(Contacts) private readonly contactsRepository: typeof Contacts,
    @InjectModel(ContactPhones)
    private readonly contactPhonesRepository: typeof ContactPhones,
    @InjectModel(Users)
    private readonly usersRepository: typeof Users,
    @InjectModel(Tags)
    private readonly tagsRepository: typeof Tags,
    @InjectModel(Cities)
    private readonly citiesRepository: typeof Cities,
    @InjectModel(ContactSources)
    private readonly sourcesRepository: typeof ContactSources,
  ) {}

  async getAll(): Promise<Contacts[]> {
    return this.contactsRepository.findAll();
  }

  async getOne(contactId: number): Promise<Contacts> {
    const contact = await this.contactsRepository.findOne({
      where: { contactId },
      include: [
        { model: ContactPhones },
        {
          model: Users,
          as: 'manager',
          attributes: { exclude: ['password', 'accessToken'] },
        },
        { model: Tags, through: { attributes: [] } }, // { attributes: [] } is to not nest some ref values !Note: many to many
        { model: Cities },
        { model: ContactSources },
      ],
    });

    if (!contact) {
      throw new NotFoundException(`Contact with ID ${contactId} not found`);
    }

    return contact;
  }

  async createContact(createContactDto: CreateContactDto): Promise<Contacts> {
    const { fullName, contactPhones, managerId, cityId, sourceId, birthDate } =
      createContactDto;

    const manager = await this.usersRepository.findOne({
      where: { userId: managerId },
    });
    if (!manager) {
      throw new NotFoundException(
        `Manager with ID ${managerId} does not exist`,
      );
    }

    if (cityId) {
      const city = await this.citiesRepository.findByPk(cityId);
      if (!city) {
        throw new NotFoundException(`City with ID ${cityId} does not exist`);
      }
    }

    if (sourceId) {
      const source = await this.sourcesRepository.findByPk(sourceId);
      if (!source) {
        throw new NotFoundException(
          `Source with ID ${sourceId} does not exist`,
        );
      }
    }

    const contact = await this.contactsRepository.create({
      fullName,
      managerId,
      cityId,
      sourceId,
      birthDate,
    });

    const phoneRecords = contactPhones?.map((phone) =>
      this.contactPhonesRepository.create({
        contactId: contact.contactId,
        phoneNumber: phone.phoneNumber,
      }),
    );

    await Promise.all(phoneRecords);

    return this.getOne(contact.contactId);
  }

  async addTagsToContact(
    contactId: number,
    tagIds: number[],
  ): Promise<Contacts> {
    const contact = await this.contactsRepository.findByPk(contactId, {
      include: [
        {
          model: Tags,
        },
      ],
    });

    if (!contact) {
      throw new NotFoundException(`Contact with ID ${contactId} not found`);
    }

    if (tagIds?.length) {
      const tags = await this.tagsRepository.findAll({
        where: { tagId: tagIds },
      });

      if (!tags.length) {
        throw new NotFoundException(`Tags not found`);
      }

      await contact.$set('tags', tags);
    } else {
      await contact.$set('tags', []);
    }

    return this.contactsRepository.findByPk(contactId, {
      include: [
        {
          model: Tags,
          through: { attributes: [] },
        },
      ],
    });
  }

  async updateContact(
    contactId: number,
    updateContactDto: UpdateContactDto,
  ): Promise<Contacts> {
    const { fullName, managerId, cityId, sourceId, birthDate } =
      updateContactDto;

    const contact = await this.contactsRepository.findByPk(contactId, {
      include: [{ model: ContactPhones }, { model: Users, as: 'manager' }],
    });

    if (!contact) {
      throw new NotFoundException(`Contact with ID ${contactId} not found`);
    }

    if (managerId !== undefined) {
      if (managerId === null) {
        contact.managerId = null;
      } else {
        const manager = await this.usersRepository.findByPk(managerId);
        if (!manager) {
          throw new NotFoundException(
            `Manager with ID ${managerId} does not exist`,
          );
        }
        contact.managerId = managerId;
      }
    }

    if (cityId !== undefined) {
      if (cityId === null) {
        contact.cityId = null;
      } else {
        const city = await this.citiesRepository.findByPk(cityId);
        if (!city) {
          throw new NotFoundException(`City with ID ${cityId} does not exist`);
        }
        contact.cityId = cityId;
      }
    }

    if (sourceId !== undefined) {
      if (sourceId === null) {
        contact.sourceId = null;
      } else {
        const source = await this.sourcesRepository.findByPk(sourceId);
        if (!source) {
          throw new NotFoundException(
            `Source with ID ${sourceId} does not exist`,
          );
        }
        contact.sourceId = sourceId;
      }
    }

    if (fullName !== contact.fullName) {
      contact.fullName = fullName;
    }

    contact.birthDate = birthDate;

    await contact.save();

    return this.getOne(contactId);
  }

  async updateContactPhones(
    contactId: number,
    phones: UpdatePhoneDto[],
  ): Promise<ContactPhones[]> {
    const contact = await this.contactsRepository.findByPk(contactId);

    if (!contact) {
      throw new NotFoundException(`Contact with ID ${contactId} not found`);
    }

    const updatedPhones: ContactPhones[] = [];

    for (const phone of phones) {
      if (phone.phoneId) {
        await this.contactPhonesRepository.update(
          { phoneNumber: phone.phoneNumber },
          { where: { phoneId: phone.phoneId, contactId } },
        );
        const updatedPhone = await this.contactPhonesRepository.findByPk(
          phone.phoneId,
        );
        updatedPhones.push(updatedPhone);
      } else {
        const newPhone = await this.contactPhonesRepository.create({
          contactId: contact.contactId,
          phoneNumber: phone.phoneNumber,
        });
        updatedPhones.push(newPhone);
      }
    }

    return updatedPhones;
  }

  async deleteContactPhones(
    contactId: number,
    phoneIds: number[],
  ): Promise<void> {
    const contact = await this.contactsRepository.findByPk(contactId, {
      include: [ContactPhones],
    });

    if (!contact) {
      throw new NotFoundException(`Contact with ID ${contactId} not found`);
    }

    const phonesToDelete = await this.contactPhonesRepository.findAll({
      where: { contactId, phoneId: phoneIds },
    });

    if (phonesToDelete.length !== phoneIds.length) {
      throw new NotFoundException(
        `One or more phone IDs not found for this contact`,
      );
    }

    await this.contactPhonesRepository.destroy({
      where: { phoneId: phoneIds },
    });
  }

  async deleteContact(contactId: number): Promise<{ message: string }> {
    const contact = await this.contactsRepository.findByPk(contactId, {
      include: [ContactPhones],
    });

    if (!contact) {
      throw new NotFoundException(`Contact with ID ${contactId} not found`);
    }

    await this.contactsRepository.destroy({
      where: { contactId },
    });

    return {
      message: `Contact with ID ${contactId} and its phones were deleted successfully`,
    };
  }
}
