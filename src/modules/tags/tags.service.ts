import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Tags } from './tags.model';
import { AppGateway } from '../../gateway/app.gateway';
import dayjs from 'dayjs';
import { Op } from 'sequelize';

@Injectable()
export class TagsService {
  private readonly logger = new Logger(TagsService.name);

  constructor(
    @InjectModel(Tags)
    private readonly tagRepository: typeof Tags,
    private readonly appGateway: AppGateway,
  ) {}

  async createTag(name: string): Promise<Tags> {
    this.logger.log(`Creating tag with name: ${name}`);
    try {
      const tag = await this.tagRepository.create({ name });
      this.logger.log(`Successfully created tag with ID: ${tag.tagId}`);

      // Emit tag_created event
      this.appGateway.server.emit('tag_created', {
        payload: tag,
        lastUpdatedAt: dayjs().toISOString(),
      });

      return tag;
    } catch (error) {
      this.logger.error(`Error creating tag with name: ${name}`, error);
      throw new Error('Failed to create tag');
    }
  }

  async getAllTags(lastUpdated?: string): Promise<Tags[]> {
    this.logger.log('Fetching all tags');
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
      return await this.tagRepository.findAll(options);
    } catch (error) {
      this.logger.error('Error fetching all tags', error);
      throw new Error('Failed to fetch tags');
    }
  }

  async updateTag(tagId: number, name: string): Promise<Tags> {
    this.logger.log(`Updating tag with ID: ${tagId}`);
    try {
      const tag = await this.tagRepository.findByPk(tagId);

      if (!tag) {
        this.logger.warn(`No tag found with ID: ${tagId}`);
        throw new HttpException(
          `Tag with ID ${tagId} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      tag.name = name;
      await tag.save();
      this.logger.log(`Successfully updated tag with ID: ${tagId}`);

      // Emit tag_updated event
      this.appGateway.server.emit('tag_updated', {
        payload: tag,
        lastUpdatedAt: dayjs().toISOString(),
      });

      return tag;
    } catch (error) {
      this.logger.error(`Error updating tag ID: ${tagId}`, error);
      throw new Error('Failed to update tag');
    }
  }

  async deleteTag(tagId: number): Promise<{ message: string }> {
    this.logger.log(`Attempting to delete tag with ID: ${tagId}`);
    try {
      const tag = await this.tagRepository.findByPk(tagId);

      if (!tag) {
        this.logger.warn(`No tag found with ID: ${tagId}`);
        throw new HttpException(
          `Tag with ID ${tagId} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      await tag.destroy();
      this.logger.log(`Successfully deleted tag with ID: ${tagId}`);

      // Emit tag_deleted event
      this.appGateway.server.emit('tag_deleted', {
        payload: { tagId },
        lastUpdatedAt: dayjs().toISOString(),
      });

      return { message: `Tag with ID ${tagId} deleted successfully` };
    } catch (error) {
      this.logger.error(`Error deleting tag ID: ${tagId}`, error);
      throw new Error('Failed to delete tag');
    }
  }
}
