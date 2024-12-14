import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Contacts } from './contacts.model';
import { UsersModule } from '../users/users.module';

@Module({
  controllers: [],
  imports: [
    forwardRef(() => UsersModule),
    SequelizeModule.forFeature([Contacts]),
  ],
  exports: [SequelizeModule],
  providers: [],
})
export class ContactsModule {}
