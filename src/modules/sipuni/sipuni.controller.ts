import { Controller, Post, Body, UseGuards, Req, HttpException, HttpStatus } from '@nestjs/common';
import { SipuniService, SipuniResponse } from './sipuni.service';
import { AuthGuard, ExpressGuarded } from '../auth/guards/auth.guard';

@Controller('sipuni')
@UseGuards(AuthGuard)
export class SipuniController {
  constructor(private readonly sipuniService: SipuniService) {}

  @Post('call')
  async makeCall(
    @Body('contactId') contactId: number,
    @Body('phoneId') phoneId: number | undefined,
    @Req() req: ExpressGuarded
  ): Promise<SipuniResponse> {
    if (!req.user?.userId) {
      throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
    }
    return this.sipuniService.makeCall(contactId, phoneId, req.user.userId);
  }

  @Post('cancel')
  async cancelCall(@Body('callbackId') callbackId: string): Promise<SipuniResponse> {
    return this.sipuniService.cancelCall(callbackId);
  }
} 