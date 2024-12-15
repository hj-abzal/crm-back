import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ContactsModule } from '../contacts/contacts.module';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { ContactSources } from './contact-source.model';
import { ContactSourcesService } from './contact-sources.service';
import { ContactSourcesController } from './contact-sources.controller';

@Module({
  imports: [
    SequelizeModule.forFeature([ContactSources]),
    forwardRef(() => UsersModule),
    forwardRef(() => ContactsModule),
    AuthModule,
  ],
  controllers: [ContactSourcesController],
  providers: [ContactSourcesService],
  exports: [SequelizeModule],
})
export class ContactSourceModule {}
