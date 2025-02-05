import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Tags } from './tags.model';
import { AppGateway } from '../../gateway/app.gateway';
import { Op } from 'sequelize';

@Injectable()
export class TagsService {
  private readonly logger = new Logger(TagsService.name);

  constructor(
    @InjectModel(Tags)
    private readonly tagsRepository: typeof Tags,
    private readonly appGateway: AppGateway,
  ) {}

  async createTag(name: string): Promise<Tags> {
    this.logger.log(`Creating tag with name: ${name}`);
    try {
      const tag = await this.tagsRepository.create({ name });
      this.logger.log(`Successfully created tag with ID: ${tag.tagId}`);
      // Emit tag_created event
      this.appGateway.server.emit('tag_created', {
        payload: tag,
      });

      return tag;
    } catch (error) {
      this.logger.error(`Error creating tag with name: ${name}`, error);
      throw new Error('Failed to create tag');
    }
  }

  async getAllTags(
    lastUpdated?: string,
  ): Promise<{ lastUpdatedAt: string | null; payload: Tags[] }> {
    try {
      const tagsLastUpdatedAt = await this.tagsRepository.max('updatedAt', {
        paranoid: false,
      });

      const options: any = {};
      if (lastUpdated) {
        options.where = {
          updatedAt: {
            [Op.gt]: new Date(lastUpdated),
          },
        };
        options.paranoid = false;
      }

      const tags = await this.tagsRepository.findAll(options);

      return {
        lastUpdatedAt: tagsLastUpdatedAt
          ? (tagsLastUpdatedAt as Date).toISOString()
          : null,
        payload: tags,
      };
    } catch (error) {
      this.logger.error('Error fetching all tags', error);
      throw new Error('Failed to fetch tags');
    }
  }

  async updateTag(tagId: number, name: string): Promise<Tags> {
    this.logger.log(`Updating tag with ID: ${tagId}`);
    try {
      const tag = await this.tagsRepository.findByPk(tagId);
      if (!tag) {
        throw new HttpException('Tag not found', HttpStatus.NOT_FOUND);
      }

      tag.name = name;
      await tag.save();
      this.logger.log(`Successfully updated tag with ID: ${tagId}`);

      // Emit tag_updated event
      this.appGateway.server.emit('tag_updated', {
        payload: tag,
      });

      return tag;
    } catch (error) {
      throw error;
    }
  }

  async deleteTag(tagId: number): Promise<void> {
    try {
      const tag = await this.tagsRepository.findByPk(tagId);
      if (!tag) {
        throw new HttpException('Tag not found', HttpStatus.NOT_FOUND);
      }

      await tag.destroy();
      this.logger.log(`Successfully deleted tag with ID: ${tagId}`);

      // Emit tag_deleted event
      this.appGateway.server.emit('tag_deleted', {
        payload: { tagId },
      });
    } catch (error) {
      this.logger.error(`Error deleting tag ID: ${tagId}`, error);
      throw new Error('Failed to delete tag');
    }
  }
}
