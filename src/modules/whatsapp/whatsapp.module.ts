import { Module } from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';
import { WhatsAppController } from './whatsapp.controller';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { GatewaysModule } from 'src/gateway/gateways.module';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';


@Module({
  imports: [EventEmitterModule.forRoot(),  GatewaysModule, UsersModule, AuthModule],
  controllers: [WhatsAppController],
  providers: [WhatsAppService],
  exports: [WhatsAppService],
})
export class WhatsAppModule {} 