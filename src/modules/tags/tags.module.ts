import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TagsController } from './tags.controller';
import { TagsService } from './tags.service';
import { Tags } from './tags.model';
import { ContactTag } from './contact-tag.model';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { GatewaysModule } from '../../gateway/gateways.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Tags, ContactTag]),
    AuthModule,
    forwardRef(() => UsersModule),
    GatewaysModule,
  ],
  controllers: [TagsController],
  providers: [TagsService],
  exports: [SequelizeModule],
})
export class TagsModule {}
