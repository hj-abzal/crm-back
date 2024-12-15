import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Cities } from './cities.model';

@Injectable()
export class CitiesService {
  constructor(
    @InjectModel(Cities) private readonly cityRepository: typeof Cities,
  ) {}

  async createCity(name: string): Promise<Cities> {
    return this.cityRepository.create({ name });
  }

  async getAllCities(): Promise<Cities[]> {
    return this.cityRepository.findAll();
  }

  async updateCity(cityId: number, name: string): Promise<Cities> {
    const city = await this.cityRepository.findByPk(cityId);

    if (!city) {
      throw new NotFoundException(`City with ID ${cityId} not found`);
    }

    city.name = name;
    await city.save();

    return city;
  }

  async deleteCity(cityId: number): Promise<{ message: string }> {
    const city = await this.cityRepository.findByPk(cityId);

    if (!city) {
      throw new NotFoundException(`City with ID ${cityId} not found`);
    }

    await city.destroy();

    return { message: `City with ID ${cityId} deleted successfully` };
  }
}
