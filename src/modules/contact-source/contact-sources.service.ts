import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ContactSources } from './contact-source.model';
import { AppGateway } from '../../gateway/app.gateway';
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
    try {
      const source = await this.contactSourcesRepository.create({ name });

      // Emit source_created event
      this.appGateway.server.emit('source_created', {
        payload: source,
      });

      return source;
    } catch (error) {
      this.logger.error(`Error creating source with name: ${name}`, error);
      throw new Error('Failed to create source');
    }
  }

  async getAllSources(
    lastUpdated?: string,
  ): Promise<{ lastUpdatedAt: string | null; payload: ContactSources[] }> {
    try {
      const sourcesLastUpdatedAt = await this.contactSourcesRepository.max(
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

      const sources = await this.contactSourcesRepository.findAll(options);

      return {
        lastUpdatedAt: sourcesLastUpdatedAt
          ? (sourcesLastUpdatedAt as Date).toISOString()
          : null,
        payload: sources,
      };
    } catch (error) {
      throw new Error('Failed to fetch sources');
    }
  }

  async updateSource(sourceId: number, name: string): Promise<ContactSources> {
    try {
      const source = await this.contactSourcesRepository.findByPk(sourceId);
      if (!source) {
        throw new HttpException('Source not found', HttpStatus.NOT_FOUND);
      }

      source.name = name;
      await source.save();

      // Emit source_updated event
      this.appGateway.server.emit('source_updated', {
        payload: source,
      });

      return source;
    } catch (error) {
      throw error;
    }
  }

  async deleteSource(sourceId: number): Promise<void> {
    try {
      const source = await this.contactSourcesRepository.findByPk(sourceId);
      if (!source) {
        throw new HttpException('Source not found', HttpStatus.NOT_FOUND);
      }

      await source.destroy();

      // Emit source_deleted event
      this.appGateway.server.emit('source_deleted', {
        payload: { sourceId },
      });
    } catch (error) {
      throw error;
    }
  }
}
