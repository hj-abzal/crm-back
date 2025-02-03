import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ContactsModule } from '../contacts/contacts.module';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { ContactStatusService } from './contact-status.service';
import { ContactStatusController } from './contact-status.controller';
import { ContactStatuses } from './contact-status.model';
import { GatewaysModule } from 'src/gateway/gateways.module';

@Module({
  imports: [
    SequelizeModule.forFeature([ContactStatuses]),
    forwardRef(() => UsersModule),
    forwardRef(() => ContactsModule),
    AuthModule,
    GatewaysModule
  ],
  controllers: [ContactStatusController],
  providers: [ContactStatusService],
  exports: [SequelizeModule],
})
export class ContactStatusModule {}
