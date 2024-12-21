import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Comments } from './comments.model';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  controllers: [CommentsController],
  imports: [
    SequelizeModule.forFeature([Comments]),
    AuthModule,
    forwardRef(() => UsersModule),
  ],
  providers: [CommentsService],
  exports: [],
})
export class CommentsModule {}
