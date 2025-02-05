import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ContactStatuses } from './contact-status.model';
import { AppGateway } from '../../gateway/app.gateway';
import { Op } from 'sequelize';

@Injectable()
export class ContactStatusService {
  private readonly logger = new Logger(ContactStatusService.name);

  constructor(
    @InjectModel(ContactStatuses)
    private readonly contactStatusesRepository: typeof ContactStatuses,
    private readonly appGateway: AppGateway,
  ) {}

  async createStatus(name: string): Promise<ContactStatuses> {
    this.logger.log(`Creating contact status with name: ${name}`);
    try {
      const status = await this.contactStatusesRepository.create({ name });
      this.logger.log(
        `Successfully created status with ID: ${status.statusId}`,
      );

      // Emit status_created event
      this.appGateway.server.emit('status_created', {
        payload: status,
      });

      return status;
    } catch (error) {
      this.logger.error(`Error creating status with name: ${name}`, error);
      throw new Error('Failed to create status');
    }
  }

  async getAllStatuses(
    lastUpdated?: string,
  ): Promise<{ lastUpdatedAt: string | null; payload: ContactStatuses[] }> {
    this.logger.log('Fetching all contact statuses');
    try {
      const statusesLastUpdatedAt = await this.contactStatusesRepository.max(
        'updatedAt',
        {
          paranoid: false,
        },
      );

      const options: any = {};
      if (lastUpdated) {
        options.where = {
          updatedAt: {
            [Op.gt]: new Date(lastUpdated),
          },
        };
        options.paranoid = false;
      }

      const statuses = await this.contactStatusesRepository.findAll(options);

      return {
        lastUpdatedAt: statusesLastUpdatedAt
          ? (statusesLastUpdatedAt as Date).toISOString()
          : null,
        payload: statuses,
      };
    } catch (error) {
      this.logger.error('Error fetching all statuses', error);
      throw new Error('Failed to fetch statuses');
    }
  }

  async updateStatus(statusId: number, name: string): Promise<ContactStatuses> {
    this.logger.log(`Updating status with ID: ${statusId}`);
    try {
      const status = await this.contactStatusesRepository.findByPk(statusId);

      if (!status) {
        this.logger.warn(`No status found with ID: ${statusId}`);
        throw new HttpException(
          `Status with ID ${statusId} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      status.name = name;
      await status.save();
      this.logger.log(`Successfully updated status with ID: ${statusId}`);

      // Emit status_updated event
      this.appGateway.server.emit('status_updated', {
        payload: status,
      });

      return status;
    } catch (error) {
      this.logger.error(`Error updating status ID: ${statusId}`, error);
      throw error;
    }
  }

  async deleteStatus(statusId: number): Promise<void> {
    this.logger.log(`Attempting to delete status with ID: ${statusId}`);
    try {
      const status = await this.contactStatusesRepository.findByPk(statusId);

      if (!status) {
        this.logger.warn(`No status found with ID: ${statusId}`);
        throw new HttpException(
          `Status with ID ${statusId} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      await status.destroy();
      this.logger.log(`Successfully deleted status with ID: ${statusId}`);

      // Emit status_deleted event
      this.appGateway.server.emit('status_deleted', {
        payload: { statusId },
      });
    } catch (error) {
      this.logger.error(`Error deleting status ID: ${statusId}`, error);
      throw error;
    }
  }
}
