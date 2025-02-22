import { Controller, Get, HttpException, HttpStatus, Query } from '@nestjs/common';
import { InvestorsInfoService } from './investors-info.service';
import { DailySale } from './interfaces/daily-sale.interface';

@Controller('investors-info')
export class InvestorsInfoController {
  constructor(private readonly investorsInfoService: InvestorsInfoService) {}

  @Get('daily-sales')
  async getDailySales(
    @Query('tagId') tagId: number,
    @Query('statusId') statusId?: number,
  ): Promise<{ dailySales: DailySale[] }> {
    if (!tagId || !statusId) { 
        throw new HttpException('TagId and StatusId are required', HttpStatus.BAD_REQUEST);
    }

    return this.investorsInfoService.getDailySales(tagId, statusId);
  }
} 