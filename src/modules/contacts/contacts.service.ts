import { Injectable, NotFoundException, Logger } from '@nestjs/common';
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
import { Events } from '../events/events.model';
import { Comments } from '../comments/comments.model';
import { Tasks } from '../tasks/tasks.model';
import { ContactStatuses } from '../contact-status/contact-status.model';
import { Op } from 'sequelize';
import { AppGateway } from '../../gateway/app.gateway';

@Injectable()
export class ContactsService {
  private readonly logger = new Logger(ContactsService.name);

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
    @InjectModel(ContactStatuses)
    private readonly statusesRepository: typeof ContactStatuses,
    private readonly appGateway: AppGateway,
  ) {}

  async getAll(
    page: number,
    limit: number,
    lastUpdated?: string,
    managerId?: number,
  ): Promise<{
    contacts: Contacts[];
    totalCount: number;
    lastUpdatedAt: string | null;
  }> {
    this.logger.log(`Fetching contacts - page: ${page}, limit: ${limit}`);
    try {
      const contactsLastUpdatedAt = await this.contactsRepository.max(
        'updatedAt',
        {
          paranoid: false,
        },
      );

      const whereClause: any = {};
      if (lastUpdated) {
        whereClause.updatedAt = {
          [Op.gt]: new Date(lastUpdated),
        };
      }

      if (managerId) {
        whereClause.managerId = managerId;
      }

      const options: any = {
        where: whereClause,
        include: [
          {
            model: ContactPhones,
            paranoid: false,
          },
          {
            model: Tags,
            through: { attributes: [] },
          },
        ],
      };

      if (lastUpdated) {
        options.paranoid = false;
      } else {
        options.offset = (page - 1) * limit;
        options.limit = limit;
      }

      const contacts = await this.contactsRepository.findAll(options);
      const totalCount = await this.contactsRepository.count({
        where: whereClause,
      });

      return {
        contacts,
        totalCount,
        lastUpdatedAt: contactsLastUpdatedAt
          ? (contactsLastUpdatedAt as Date).toISOString()
          : null,
      };
    } catch (error) {
      this.logger.error('Error fetching contacts', error);
      throw new Error('Failed to fetch contacts');
    }
  }

  async getOne(contactId: number): Promise<Contacts> {
    const contact = await this.contactsRepository.findOne({
      where: { contactId },
      include: [
        { model: ContactPhones },
        {
          model: Users,
          as: 'manager',
          attributes: { exclude: ['password'] },
        },
        { model: Tags, through: { attributes: [] } }, // { attributes: [] } is to not nest some ref values !Note: many to many
        { model: Cities },
        { model: ContactSources },
        { model: Events },
        { model: Comments },
        { model: Tasks },
      ],
    });

    if (!contact) {
      throw new NotFoundException(`Contact with ID ${contactId} not found`);
    }

    return contact;
  }

  async createContact(createContactDto: CreateContactDto): Promise<Contacts> {
    this.logger.log('Creating new contact');
    try {
      const {
        fullName,
        contactPhones,
        managerId,
        cityId,
        sourceId,
        statusId,
        birthDate,
        tagIds,
      } = createContactDto;

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

      if (statusId) {
        const status = await this.statusesRepository.findByPk(statusId);
        if (!status) {
          throw new NotFoundException(
            `Status with ID ${statusId} does not exist`,
          );
        }
      }

      const contact = await this.contactsRepository.create({
        fullName,
        managerId,
        cityId,
        sourceId,
        statusId,
        birthDate,
      });

      const phoneRecords = contactPhones?.map((phone) =>
        this.contactPhonesRepository.create({
          contactId: contact.contactId,
          phoneNumber: phone.phoneNumber,
        }),
      );

      await Promise.all(phoneRecords);

      if (tagIds?.length) {
        const tags = await this.tagsRepository.findAll({
          where: { tagId: tagIds },
        });

        if (!tags.length) {
          throw new NotFoundException(`Tags not found`);
        }

        await contact.$set('tags', tags);
      }

      const createdContact = await this.getOne(contact.contactId);

      // Emit contact_created event
      this.appGateway.server.emit('contact_created', {
        payload: createdContact,
      });

      return createdContact;
    } catch (error) {
      this.logger.error('Error creating contact', error);
      throw error;
    }
  }

  async addTagsToContact(
    contactId: number,
    tagIds: number[],
  ): Promise<Contacts> {
    this.logger.log(`Adding tags to contact ID: ${contactId}`);
    try {
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

      const updatedContact = await this.contactsRepository.findByPk(contactId, {
        include: [
          {
            model: Tags,
            through: { attributes: [] },
          },
        ],
      });

      // Emit contact_tags_updated event
      this.appGateway.server.emit('contact_tags_updated', {
        payload: { contactId, tags: updatedContact.tags },
      });

      return updatedContact;
    } catch (error) {
      this.logger.error(`Error adding tags to contact ID: ${contactId}`, error);
      throw error;
    }
  }

  async updateContact(
    contactId: number,
    updateContactDto: UpdateContactDto,
  ): Promise<Contacts> {
    this.logger.log(`Updating contact with ID: ${contactId}`);
    try {
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
            throw new NotFoundException(
              `City with ID ${cityId} does not exist`,
            );
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

      const updatedContact = await this.getOne(contactId);

      // Emit contact_updated event
      this.appGateway.server.emit('contact_updated', {
        payload: updatedContact,
      });

      return updatedContact;
    } catch (error) {
      this.logger.error(`Error updating contact ID: ${contactId}`, error);
      throw error;
    }
  }

  async updateContactPhones(
    contactId: number,
    phones: UpdatePhoneDto[],
  ): Promise<ContactPhones[]> {
    this.logger.log(`Updating phones for contact ID: ${contactId}`);
    try {
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

      // Emit contact_phones_updated event
      this.appGateway.server.emit('contact_phones_updated', {
        payload: { contactId, phones: updatedPhones },
      });

      return updatedPhones;
    } catch (error) {
      this.logger.error(
        `Error updating phones for contact ID: ${contactId}`,
        error,
      );
      throw error;
    }
  }

  async deleteContactPhones(
    contactId: number,
    phoneIds: number[],
  ): Promise<void> {
    this.logger.log(`Deleting phones for contact ID: ${contactId}`);
    try {
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

      // Emit contact_phones_deleted event
      this.appGateway.server.emit('contact_phones_deleted', {
        payload: { contactId, phoneIds },
      });
    } catch (error) {
      this.logger.error(
        `Error deleting phones for contact ID: ${contactId}`,
        error,
      );
      throw error;
    }
  }

  async deleteContact(contactId: number): Promise<{ message: string }> {
    this.logger.log(`Deleting contact with ID: ${contactId}`);
    try {
      const contact = await this.contactsRepository.findByPk(contactId, {
        include: [ContactPhones],
      });

      if (!contact) {
        throw new NotFoundException(`Contact with ID ${contactId} not found`);
      }

      await this.contactsRepository.destroy({
        where: { contactId },
      });

      // Emit contact_deleted event
      this.appGateway.server.emit('contact_deleted', {
        payload: { contactId },
      });

      return {
        message: `Contact with ID ${contactId} and its phones were deleted successfully`,
      };
    } catch (error) {
      this.logger.error(`Error deleting contact ID: ${contactId}`, error);
      throw error;
    }
  }
}
