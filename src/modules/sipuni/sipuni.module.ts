import { Module } from '@nestjs/common';
import { SipuniService } from './sipuni.service';
import { SipuniController } from './sipuni.controller';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { Users } from '../users/users.model';
import { Contacts } from '../contacts/models/contacts.model';
import { ContactPhones } from '../contacts/models/contact-phones.model';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    SequelizeModule.forFeature([Users, Contacts, ContactPhones])
  ],
  controllers: [SipuniController],
  providers: [SipuniService],
  exports: [SipuniService],
})
export class SipuniModule {} 