import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Contacts } from '../contacts/models/contacts.model';
import { Tags } from '../tags/tags.model';
import { ContactTag } from '../tags/contact-tag.model';
import { ContactStatuses } from '../contact-status/contact-status.model';
import { InvestorsInfoController } from './investors-info.controller';
import { InvestorsInfoService } from './investors-info.service';

@Module({
  imports: [
    SequelizeModule.forFeature([Contacts, Tags, ContactTag, ContactStatuses]),
  ],
  controllers: [InvestorsInfoController],
  providers: [InvestorsInfoService],
})
export class InvestorsInfoModule {} 