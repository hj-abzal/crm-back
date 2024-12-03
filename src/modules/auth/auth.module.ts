import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { MailsModule } from '../mails/mails.module';
import { jwtConstants } from './constants';
import { AuthService } from './auth.service';
import { LocalGuard } from './guards/local.guard';
import { UsersModule } from '../users/users.module';

@Module({
  controllers: [AuthController],
  imports: [
    UsersModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1d' },
    }),
    MailsModule,
  ],
  providers: [AuthService, LocalGuard],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
