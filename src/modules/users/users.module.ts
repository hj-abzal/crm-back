import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Users } from './users.model';
import { UsersService } from './users.service';
import { AuthModule } from '../auth/auth.module';
import { UserController } from './user.controller';
import { ContactsModule } from '../contacts/contacts.module';
import { GatewaysModule } from '../../gateway/gateways.module';

@Module({
  controllers: [UserController],
  providers: [UsersService],
  imports: [
    forwardRef(() => AuthModule),
    SequelizeModule.forFeature([Users]),
    forwardRef(() => ContactsModule),
    GatewaysModule,
  ],
  exports: [UsersService, SequelizeModule],
})
export class UsersModule {}
