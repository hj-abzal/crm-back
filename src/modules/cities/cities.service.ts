import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Cities } from './cities.model';
import { AppGateway } from '../../gateway/app.gateway';
import dayjs from 'dayjs';
import { Op } from 'sequelize';

@Injectable()
export class CitiesService {
  private readonly logger = new Logger(CitiesService.name);

  constructor(
    @InjectModel(Cities)
    private readonly cityRepository: typeof Cities,
    private readonly appGateway: AppGateway,
  ) {}

  async createCity(name: string): Promise<Cities> {
    this.logger.log(`Creating city with name: ${name}`);
    try {
      const city = await this.cityRepository.create({ name });
      this.logger.log(`Successfully created city with ID: ${city.id}`);

      // Emit city_created event
      this.appGateway.server.emit('city_created', {
        payload: city,
        lastUpdatedAt: dayjs().toISOString(),
      });

      return city;
    } catch (error) {
      this.logger.error(`Error creating city with name: ${name}`, error);
      throw new Error('Failed to create city');
    }
  }

  async getAllCities(lastUpdated?: string): Promise<Cities[]> {
    this.logger.log('Fetching all cities');
    try {
      const options: any = {};
      if (lastUpdated) {
        options.where = {
          updatedAt: {
            [Op.gte]: lastUpdated,
          },
        };
        options.paranoid = false;
      }
      return await this.cityRepository.findAll(options);
    } catch (error) {
      this.logger.error('Error fetching all cities', error);
      throw new Error('Failed to fetch cities');
    }
  }

  async updateCity(cityId: number, name: string): Promise<Cities> {
    this.logger.log(`Updating city with ID: ${cityId}`);
    try {
      const city = await this.cityRepository.findByPk(cityId);

      if (!city) {
        this.logger.warn(`No city found with ID: ${cityId}`);
        throw new HttpException(
          `City with ID ${cityId} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      city.name = name;
      await city.save();
      this.logger.log(`Successfully updated city with ID: ${cityId}`);

      // Emit city_updated event
      this.appGateway.server.emit('city_updated', {
        payload: city,
        lastUpdatedAt: dayjs().toISOString(),
      });

      return city;
    } catch (error) {
      this.logger.error(`Error updating city ID: ${cityId}`, error);
      throw new Error('Failed to update city');
    }
  }

  async deleteCity(cityId: number): Promise<{ message: string }> {
    this.logger.log(`Attempting to delete city with ID: ${cityId}`);
    try {
      const city = await this.cityRepository.findByPk(cityId);

      if (!city) {
        this.logger.warn(`No city found with ID: ${cityId}`);
        throw new HttpException(
          `City with ID ${cityId} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      await city.destroy();
      this.logger.log(`Successfully deleted city with ID: ${cityId}`);

      // Emit city_deleted event
      this.appGateway.server.emit('city_deleted', {
        payload: { cityId },
        lastUpdatedAt: dayjs().toISOString(),
      });

      return { message: `City with ID ${cityId} deleted successfully` };
    } catch (error) {
      this.logger.error(`Error deleting city ID: ${cityId}`, error);
      throw new Error('Failed to delete city');
    }
  }
}
