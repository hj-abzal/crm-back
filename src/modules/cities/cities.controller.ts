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
} from '@nestjs/common';
import { CitiesService } from './cities.service';
import { Cities } from './cities.model';
import { USER_ROLE } from '../users/user-role.enums';
import { AuthGuard, Roles } from '../auth/guards/auth.guard';

@Controller('cities')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Post()
  @UseGuards(AuthGuard)
  @Roles(USER_ROLE.ADMIN)
  async createCity(@Body('name') name: string): Promise<Cities> {
    try {
      return await this.citiesService.createCity(name);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
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
  ): Promise<{ lastUpdatedAt: string | null; payload: Cities[] }> {
    try {
      return await this.citiesService.getAllCities(lastUpdated);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
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
  ): Promise<Cities> {
    try {
      return await this.citiesService.updateCity(cityId, name);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
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
  ): Promise<null> {
    try {
      await this.citiesService.deleteCity(cityId);
      return null;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error while deleting city. Please try again later.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
