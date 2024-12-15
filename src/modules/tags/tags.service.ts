import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Tags } from './tags.model';

@Injectable()
export class TagsService {
  constructor(
    @InjectModel(Tags)
    private readonly tagRepository: typeof Tags,
  ) {}

  async createTag(name: string): Promise<Tags> {
    return this.tagRepository.create({ name });
  }

  async updateTag(tagId: number, name: string): Promise<Tags> {
    const tag = await this.tagRepository.findByPk(tagId);
    if (!tag) {
      throw new NotFoundException(`Tag with ID ${tagId} not found`);
    }

    tag.name = name;
    await tag.save();
    return tag;
  }

  async getAllTags(): Promise<Tags[]> {
    return this.tagRepository.findAll();
  }

  async deleteTag(tagId: number): Promise<{ message: string }> {
    const tag = await this.tagRepository.findByPk(tagId);
    if (!tag) {
      throw new NotFoundException(`Tag with ID ${tagId} not found`);
    }

    await tag.destroy();
    return { message: `Tag with ID ${tagId} deleted successfully` };
  }
}
