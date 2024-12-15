import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Cities } from './cities.model';
import { ContactsModule } from '../contacts/contacts.module';
import { CitiesController } from './cities.controller';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { CitiesService } from './cities.service';

@Module({
  imports: [
    SequelizeModule.forFeature([Cities]),
    forwardRef(() => UsersModule),
    forwardRef(() => ContactsModule),
    AuthModule,
  ],
  controllers: [CitiesController],
  providers: [CitiesService],
  exports: [SequelizeModule],
})
export class CitiesModule {}
