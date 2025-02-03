import { HttpException, HttpStatus, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ContactSources } from './contact-source.model';
import { AppGateway } from '../../gateway/app.gateway';
import dayjs from 'dayjs';
import { Op } from 'sequelize';

@Injectable()
export class ContactSourcesService {
  private readonly logger = new Logger(ContactSourcesService.name);

  constructor(
    @InjectModel(ContactSources)
    private readonly contactSourcesRepository: typeof ContactSources,
    private readonly appGateway: AppGateway,
  ) {}

  async createSource(name: string): Promise<ContactSources> {
    this.logger.log(`Creating contact source with name: ${name}`);
    try {
      const source = await this.contactSourcesRepository.create({ name });
      this.logger.log(`Successfully created source with ID: ${source.id}`);

      // Emit source_created event
      this.appGateway.server.emit('source_created', {
        payload: source,
        lastUpdatedAt: dayjs().toISOString(),
      });

      return source;
    } catch (error) {
      this.logger.error(`Error creating source with name: ${name}`, error);
      throw new Error('Failed to create source');
    }
  }

  async getAllSources(lastUpdated?: string): Promise<ContactSources[]> {
    this.logger.log('Fetching all contact sources');
    try {
      const options: any = {};
      if (lastUpdated) {
        options.where = {
          updatedAt: {
            [Op.gte]: lastUpdated,
          },
        };
        options.paranoid = false;
      }
      return await this.contactSourcesRepository.findAll(options);
    } catch (error) {
      this.logger.error('Error fetching all sources', error);
      throw new Error('Failed to fetch sources');
    }
  }

  async updateSource(sourceId: number, name: string): Promise<ContactSources> {
    this.logger.log(`Updating source with ID: ${sourceId}`);
    try {
      const source = await this.contactSourcesRepository.findByPk(sourceId);

      if (!source) {
        this.logger.warn(`No source found with ID: ${sourceId}`);
        throw new HttpException(
          `Source with ID ${sourceId} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      source.name = name;
      await source.save();
      this.logger.log(`Successfully updated source with ID: ${sourceId}`);

      // Emit source_updated event
      this.appGateway.server.emit('source_updated', {
        payload: source,
        lastUpdatedAt: dayjs().toISOString(),
      });

      return source;
    } catch (error) {
      this.logger.error(`Error updating source ID: ${sourceId}`, error);
      throw new Error('Failed to update source');
    }
  }

  async deleteSource(sourceId: number): Promise<{ message: string }> {
    this.logger.log(`Attempting to delete source with ID: ${sourceId}`);
    try {
      const source = await this.contactSourcesRepository.findByPk(sourceId);

      if (!source) {
        this.logger.warn(`No source found with ID: ${sourceId}`);
        throw new HttpException(
          `Source with ID ${sourceId} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      await source.destroy();
      this.logger.log(`Successfully deleted source with ID: ${sourceId}`);

      // Emit source_deleted event
      this.appGateway.server.emit('source_deleted', {
        payload: { sourceId },
        lastUpdatedAt: dayjs().toISOString(),
      });

      return { message: `Source with ID ${sourceId} deleted successfully` };
    } catch (error) {
      this.logger.error(`Error deleting source ID: ${sourceId}`, error);
      throw new Error('Failed to delete source');
    }
  }
}
