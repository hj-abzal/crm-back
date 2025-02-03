import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ContactStatuses } from './contact-status.model';

@Injectable()
export class ContactStatusService {
  constructor(
    @InjectModel(ContactStatuses)
    private readonly contactStatusesRepository: typeof ContactStatuses,
  ) {}

  async createStatus(name: string): Promise<ContactStatuses> {
    return this.contactStatusesRepository.create({ name });
  }

  async getAllStatuses(): Promise<ContactStatuses[]> {
    return this.contactStatusesRepository.findAll();
  }

  async updateStatus(statusId: number, name: string): Promise<ContactStatuses> {
    const status = await this.contactStatusesRepository.findByPk(statusId);

    if (!status) {
      throw new NotFoundException(`Status with ID ${statusId} not found`);
    }

    status.name = name;
    await status.save();

    return status;
  }

  async deleteStatus(statusId: number): Promise<{ message: string }> {
    const status = await this.contactStatusesRepository.findByPk(statusId);

    if (!status) {
      throw new NotFoundException(`Status with ID ${statusId} not found`);
    }

    await status.destroy();

    return { message: `Status with ID ${statusId} deleted successfully` };
  }
}
