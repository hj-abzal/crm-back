import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Query,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { CitiesService } from './cities.service';
import { Cities } from './cities.model';
import { USER_ROLE } from '../users/user-role.enums';
import { AuthGuard, Roles } from '../auth/guards/auth.guard';
import { EventPayload } from '../users/user.interface';
import dayjs from 'dayjs';

@Controller('cities')
export class CitiesController {
  private readonly logger = new Logger(CitiesController.name);

  constructor(private readonly citiesService: CitiesService) {}

  @Post()
  @UseGuards(AuthGuard)
  @Roles(USER_ROLE.ADMIN)
  async createCity(@Body('name') name: string): Promise<EventPayload<Cities>> {
    try {
      const city = await this.citiesService.createCity(name);
      return {
        lastUpdatedAt: dayjs().toISOString(),
        payload: city,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(
        'Unexpected error while creating city',
        error.stack || error.message,
      );

      throw new HttpException(
        'Error while creating city. Please try again later.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @UseGuards(AuthGuard)
  async getAllCities(
    @Query('lastUpdatedAt') lastUpdated?: string,
  ): Promise<EventPayload<Cities[]>> {
    try {
      const cities = await this.citiesService.getAllCities(lastUpdated);
      return {
        lastUpdatedAt: dayjs().toISOString(),
        payload: cities,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(
        'Unexpected error while fetching cities',
        error.stack || error.message,
      );

      throw new HttpException(
        'Error while fetching cities. Please try again later.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':cityId')
  @UseGuards(AuthGuard)
  @Roles(USER_ROLE.ADMIN)
  async updateCity(
    @Param('cityId', ParseIntPipe) cityId: number,
    @Body('name') name: string,
  ): Promise<EventPayload<Cities>> {
    try {
      const city = await this.citiesService.updateCity(cityId, name);
      return {
        lastUpdatedAt: dayjs().toISOString(),
        payload: city,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(
        'Unexpected error while updating city',
        error.stack || error.message,
      );

      throw new HttpException(
        'Error while updating city. Please try again later.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':cityId')
  @UseGuards(AuthGuard)
  @Roles(USER_ROLE.ADMIN)
  async deleteCity(
    @Param('cityId', ParseIntPipe) cityId: number,
  ): Promise<EventPayload<null>> {
    try {
      await this.citiesService.deleteCity(cityId);
      return {
        lastUpdatedAt: dayjs().toISOString(),
        payload: null,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(
        'Unexpected error while deleting city',
        error.stack || error.message,
      );

      throw new HttpException(
        'Error while deleting city. Please try again later.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
