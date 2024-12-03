import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Users } from './users.model';
import { UsersService } from './users.service';

@Module({
  providers: [UsersService],
  imports: [SequelizeModule.forFeature([Users])],
  exports: [UsersService],
})
export class UsersModule {}
