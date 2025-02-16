import { Controller, Post, Body, Get, HttpException, HttpStatus } from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';

@Controller('whatsapp')
export class WhatsAppController {
  constructor(private readonly whatsAppService: WhatsAppService) {}

  @Post('send-message')
  async sendMessage(
    @Body() body: { phoneNumber: string; message: string },
  ) {
    const success = await this.whatsAppService.sendMessage(
      body.phoneNumber,
      body.message,
    );

    if (!success) {
      throw new HttpException(
        'Failed to send WhatsApp message',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return { success: true };
  }

  @Get('status')
  getStatus() {
    return {
      isReady: this.whatsAppService.getIsReady(),
      qrCode: this.whatsAppService.getLatestQR(),
    };
  }
} 