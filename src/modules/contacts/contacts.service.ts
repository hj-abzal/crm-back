import {
  Injectable,
  NotFoundException,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Contacts } from './models/contacts.model';
import { ContactPhones } from './models/contact-phones.model';
import { InjectModel } from '@nestjs/sequelize';
import { Users } from '../users/users.model';
import { CreateContactDto } from './dto/create-contact.dto';
import { Tags } from '../tags/tags.model';
import { UpdateContactDto } from './dto/update-contact.dto';
import { Cities } from '../cities/cities.model';
import { ContactSources } from '../contact-source/contact-source.model';
import { Events } from '../events/events.model';
import { Comments } from '../comments/comments.model';
import { Tasks } from '../tasks/tasks.model';
import { ContactStatuses } from '../contact-status/contact-status.model';
import { Op } from 'sequelize';
import { AppGateway } from '../../gateway/app.gateway';
import { ContactReassignments } from './models/contact-reassignments.model';
import { TasksService } from '../tasks/tasks.service';
import { CommentsService } from '../comments/comments.service';

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
    @InjectModel(ContactReassignments)
    private readonly contactReassignmentsRepository: typeof ContactReassignments,
    private readonly appGateway: AppGateway,
    private readonly tasksService: TasksService,
    private readonly commentsService: CommentsService,
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
    reassignments: ContactReassignments[];
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

      let reassignments: ContactReassignments[] = [];
      if (lastUpdated && managerId) {
        reassignments = await this.contactReassignmentsRepository.findAll({
          where: {
            oldManagerId: managerId,
            reassignedAt: {
              [Op.gt]: new Date(lastUpdated),
            },
          },
          include: [
            {
              model: Contacts,
              paranoid: false,
            },
          ],
        });
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
        reassignments,
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
      if (createdContact.managerId) {
        this.appGateway.server
          .to(`manager_${createdContact.managerId}`)
          .emit('contact_created', { payload: createdContact });
      }

      this.appGateway.server
        .to('admin')
        .emit('contact_created', { payload: createdContact });

         // Create task if provided
      if (createContactDto.task) {
        const { dueDate, ...taskData } = createContactDto.task;
        await this.tasksService.create(
          {
            ...taskData,
            dueDate: dueDate?.toISOString(),
            contactId: contact.contactId,
          },
          createContactDto.managerId,
        );
      }

      // Create comment if provided
      if (createContactDto.comment) {
        await this.commentsService.create({
          ...createContactDto.comment,
          contactId: contact.contactId,
          managerId: createContactDto.managerId,
        });
      }


      return createdContact;
    } catch (error) {
      this.logger.error('Error creating contact', error);
      throw error;
    }
  }

  async updateContact(
    contactId: number,
    updateContactDto: UpdateContactDto,
  ): Promise<Contacts> {
    this.logger.log(`Updating contact with ID: ${contactId}`);
    try {
      const contact = await this.contactsRepository.findByPk(contactId, {
        include: [{ model: ContactPhones }, { model: Users, as: 'manager' }],
      });

      if (!contact) {
        throw new NotFoundException(`Contact with ID ${contactId} not found`);
      }

      let oldManagerId;

      // Track manager reassignment
      if (
        updateContactDto.managerId !== undefined &&
        updateContactDto.managerId !== contact.managerId
      ) {
        await this.contactReassignmentsRepository.create({
          contactId,
          oldManagerId: contact.managerId,
          newManagerId: updateContactDto.managerId,
        });
        oldManagerId = contact.managerId;
      }

      // Update basic fields
      if (updateContactDto.managerId !== undefined) {
        if (updateContactDto.managerId === null) {
          contact.managerId = null;
        } else {
          const manager = await this.usersRepository.findByPk(
            updateContactDto.managerId,
          );
          if (!manager) {
            throw new NotFoundException(
              `Manager with ID ${updateContactDto.managerId} does not exist`,
            );
          }
          contact.managerId = updateContactDto.managerId;
        }
      }

      if (updateContactDto.cityId !== undefined) {
        if (updateContactDto.cityId === null) {
          contact.cityId = null;
        } else {
          const city = await this.citiesRepository.findByPk(
            updateContactDto.cityId,
          );
          if (!city) {
            throw new NotFoundException(
              `City with ID ${updateContactDto.cityId} does not exist`,
            );
          }
          contact.cityId = updateContactDto.cityId;
        }
      }

      if (updateContactDto.sourceId !== undefined) {
        if (updateContactDto.sourceId === null) {
          contact.sourceId = null;
        } else {
          const source = await this.sourcesRepository.findByPk(
            updateContactDto.sourceId,
          );
          if (!source) {
            throw new NotFoundException(
              `Source with ID ${updateContactDto.sourceId} does not exist`,
            );
          }
          contact.sourceId = updateContactDto.sourceId;
        }
      }

      if (updateContactDto.fullName !== undefined) {
        contact.fullName = updateContactDto.fullName;
      }

      if (updateContactDto.birthDate !== undefined) {
        contact.birthDate = updateContactDto.birthDate;
      }

      await contact.save();

      // Update phones if provided
      if (updateContactDto.phones) {
        await this.contactPhonesRepository.destroy({ where: { contactId } });
        await this.contactPhonesRepository.bulkCreate(
          updateContactDto.phones.map((phone) => ({
            ...phone,
            contactId,
          })),
        );
      }

      // Update tags if provided
      if (updateContactDto.tagIds !== undefined) {
        if (updateContactDto.tagIds.length) {
          const tags = await this.tagsRepository.findAll({
            where: { tagId: updateContactDto.tagIds },
          });

          // Verify all requested tags were found
          if (tags.length !== updateContactDto.tagIds.length) {
            throw new HttpException(
              'One or more tags not found',
              HttpStatus.NOT_FOUND,
            );
          }

          await contact.$set('tags', tags);
        } else {
          // If empty array provided, clear all tags
          await contact.$set('tags', []);
        }
      }

      contact.changed('updatedAt', true);
      await contact.save();

      const updatedContact = await this.getOne(contactId);

      if (updatedContact.managerId) {
        this.appGateway.server
          .to(`manager_${updatedContact.managerId}`)
          .emit('contact_updated', { payload: updatedContact });
      }

      if (oldManagerId) {
        this.appGateway.server
          .to(`manager_${oldManagerId}`)
          .emit('contact_reassigned', { payload: updatedContact });
      }

      this.appGateway.server
        .to('admin')
        .emit('contact_updated', { payload: updatedContact });

      return updatedContact;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Error updating contact ID: ${contactId}`, error);
      throw new Error('Failed to update contact');
    }
  }

  async deleteContact(contactId: number): Promise<void> {
    this.logger.log(`Deleting contact with ID: ${contactId}`);
    try {
      const contact = await this.contactsRepository.findByPk(contactId, {
        include: [ContactPhones],
      });

      if (!contact) {
        throw new NotFoundException(`Contact with ID ${contactId} not found`);
      }

      const managerId = contact.managerId; // Store managerId before deletion

      await this.contactsRepository.destroy({
        where: { contactId },
      });

      if (managerId) {
        this.appGateway.server
          .to(`manager_${managerId}`)
          .emit('contact_deleted', { payload: { contactId } });
      }

      this.appGateway.server
        .to('admin')
        .emit('contact_deleted', { payload: { contactId } });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Error deleting contact ID: ${contactId}`, error);
      throw new Error('Failed to delete contact');
    }
  }
}
