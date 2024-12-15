import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { CitiesService } from './cities.service';
import { Cities } from './cities.model';

@Controller('cities')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Post()
  async createCity(@Body('name') name: string): Promise<Cities> {
    return this.citiesService.createCity(name);
  }

  @Get()
  async getAllCities(): Promise<Cities[]> {
    return this.citiesService.getAllCities();
  }

  @Put(':cityId')
  async updateCity(
    @Param('cityId', ParseIntPipe) cityId: number,
    @Body('name') name: string,
  ): Promise<Cities> {
    return this.citiesService.updateCity(cityId, name);
  }

  @Delete(':cityId')
  async deleteCity(
    @Param('cityId', ParseIntPipe) cityId: number,
  ): Promise<{ message: string }> {
    return this.citiesService.deleteCity(cityId);
  }
}
