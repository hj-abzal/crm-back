import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Contacts } from './models/contacts.model';
import { UsersModule } from '../users/users.module';
import { ContactPhones } from './models/contact-phones.model';
import { ContactsService } from './contacts.service';
import { ContactsController } from './contacts.controller';
import { TagsModule } from '../tags/tags.module';
import { AuthModule } from '../auth/auth.module';
import { CitiesModule } from '../cities/cities.module';
import { ContactSourceModule } from '../contact-source/contact-source.module';
import { ContactStatusModule } from '../contact-status/contact-status.module';
import { GatewaysModule } from 'src/gateway/gateways.module';
import { ContactReassignments } from './models/contact-reassignments.model';
import { TasksModule } from '../tasks/tasks.module';
import { CommentsModule } from '../comments/comments.module';
import { PhoneValidationPipe } from './pipes/phone-validation.pipe';
import { UpdatePhoneValidationPipe } from './pipes/update-phone-validation.pipe';

@Module({
  controllers: [ContactsController],
  imports: [
    forwardRef(() => UsersModule),
    forwardRef(() => CitiesModule),
    forwardRef(() => ContactSourceModule),
    forwardRef(() => ContactStatusModule),
    forwardRef(() => TasksModule),
    forwardRef(() => CommentsModule),
    AuthModule,
    SequelizeModule.forFeature([
      Contacts,
      ContactPhones,
      ContactReassignments,
    ]),
    TagsModule,
    GatewaysModule,
  ],
  exports: [SequelizeModule],
  providers: [
    ContactsService,
    PhoneValidationPipe,
    UpdatePhoneValidationPipe,
  ],
})
export class ContactsModule {}
