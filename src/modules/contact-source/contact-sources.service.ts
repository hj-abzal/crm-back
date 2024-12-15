import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ContactSources } from './contact-source.model';

@Injectable()
export class ContactSourcesService {
  constructor(
    @InjectModel(ContactSources)
    private readonly contactSourcesRepository: typeof ContactSources,
  ) {}

  async createSource(name: string): Promise<ContactSources> {
    return this.contactSourcesRepository.create({ name });
  }

  async getAllSources(): Promise<ContactSources[]> {
    return this.contactSourcesRepository.findAll();
  }

  async updateSource(sourceId: number, name: string): Promise<ContactSources> {
    const source = await this.contactSourcesRepository.findByPk(sourceId);

    if (!source) {
      throw new NotFoundException(`Source with ID ${source} not found`);
    }

    source.name = name;
    await source.save();

    return source;
  }

  async deleteSource(sourceId: number): Promise<{ message: string }> {
    const source = await this.contactSourcesRepository.findByPk(sourceId);

    if (!source) {
      throw new NotFoundException(`Source with ID ${sourceId} not found`);
    }

    await source.destroy();

    return { message: `Source with ID ${sourceId} deleted successfully` };
  }
}
