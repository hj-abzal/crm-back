import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Tasks } from './tasks.model';
import { TasksService } from './tasks.service';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { TasksController } from './tasks.controller';

@Module({
  controllers: [TasksController],
  imports: [
    SequelizeModule.forFeature([Tasks]),
    AuthModule,
    forwardRef(() => UsersModule),
  ],
  providers: [TasksService],
  exports: [],
})
export class TasksModule {}
