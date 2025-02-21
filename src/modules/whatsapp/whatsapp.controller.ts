import { Controller, Post, Body, Get, HttpException, HttpStatus, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';
import { Request } from 'express';
import { AuthGuard, ExpressGuarded } from '../auth/guards/auth.guard';


@Controller('whatsapp')
@UseGuards(AuthGuard)
export class WhatsAppController {
  constructor(private readonly whatsAppService: WhatsAppService) {}

  @Post('initialize')
  async initializeClient(@Req() req: ExpressGuarded) {
    try {
      await this.whatsAppService.initializeClient(req.user.userId.toString());
      return { success: true, message: 'WhatsApp client initialized successfully' };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to initialize WhatsApp client',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('send-message')
  async sendMessage(
    @Body() body: { phoneNumber: string; message: string },
    @Req() req: ExpressGuarded  ,
  ) {
    const success = await this.whatsAppService.sendMessage(
      req.user.userId.toString(),
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
  getStatus(@Req() req: ExpressGuarded) {
    return {
      isReady: this.whatsAppService.getIsReady(req.user.userId.toString()),
      qrCode: this.whatsAppService.getLatestQR(req.user.userId.toString()),
    };
  }

  @Delete('disconnect')
  async disconnectClient(@Req() req: ExpressGuarded) {
    try {
      await this.whatsAppService.disconnectClient(req.user.userId.toString());
      return { success: true, message: 'WhatsApp client disconnected successfully' };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to disconnect WhatsApp client',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('active-clients')
  getActiveClients() {
    return {
      clients: this.whatsAppService.getActiveClients(),
    };
  }
} 