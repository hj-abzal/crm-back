import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { Tasks } from './tasks.model';
import { TaskReassignments } from './task-reassignments.model';
import { Users } from '../users/users.model';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { GatewaysModule } from 'src/gateway/gateways.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Tasks, TaskReassignments, Users]),
    GatewaysModule,
    AuthModule,
    forwardRef(() => UsersModule),
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
