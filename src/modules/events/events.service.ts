import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Events } from './events.model';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Events)
    private readonly eventsRepository: typeof Events,
  ) {}

  async create(createData: Partial<Events>): Promise<Events> {
    return this.eventsRepository.create(createData);
  }

  async findAll(): Promise<Events[]> {
    return this.eventsRepository.findAll();
  }

  async findOne(eventId: number): Promise<Events> {
    const event = await this.eventsRepository.findByPk(eventId);
    if (!event) {
      throw new NotFoundException(`Event with id ${eventId} not found`);
    }
    return event;
  }

  async update(eventId: number, updateData: Partial<Events>): Promise<Events> {
    const [affectedRows, [updatedEvent]] = await this.eventsRepository.update(
      updateData,
      {
        where: { eventId },
        returning: true,
      },
    );

    if (affectedRows === 0) {
      throw new NotFoundException(`Event with id ${eventId} not found`);
    }

    return updatedEvent;
  }

  async remove(eventId: number): Promise<void> {
    const event = await this.findOne(eventId);
    await event.destroy();
  }
}
