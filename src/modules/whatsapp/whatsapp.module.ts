import { Module } from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';
import { WhatsAppController } from './whatsapp.controller';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppGateway } from 'src/gateway/app.gateway';

@Module({
  imports: [EventEmitterModule.forRoot()],
  controllers: [WhatsAppController],
  providers: [WhatsAppService, AppGateway],
  exports: [WhatsAppService],
})
export class WhatsAppModule {} 