import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Events } from './events.model';
import { EventsService } from './events.service';

@Module({
  imports: [SequelizeModule.forFeature([Events])],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
