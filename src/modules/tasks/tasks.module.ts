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
import { TaskType } from './task-type.model';
import { TaskTypeService } from './task-type.service';
import { TaskTypeController } from './task-type.controller';

@Module({
  imports: [
    SequelizeModule.forFeature([Tasks, TaskReassignments, Users, TaskType]),
    GatewaysModule,
    AuthModule,
    forwardRef(() => UsersModule),
  ],
  controllers: [TasksController, TaskTypeController],
  providers: [TasksService, TaskTypeService],
  exports: [TasksService, TaskTypeService],
})
export class TasksModule {}
