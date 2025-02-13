import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import axios from 'axios';
import { InjectModel } from '@nestjs/sequelize';
import { Users } from '../users/users.model';
import { Contacts } from '../contacts/models/contacts.model';
import { ContactPhones } from '../contacts/models/contact-phones.model';

export interface SipuniResponse {
  success: boolean;
  data?: any;
  message?: string;
}

@Injectable()
export class SipuniService {
  private readonly logger = new Logger(SipuniService.name);
  private readonly user: string;
  private readonly secret: string;

  constructor(
    private configService: ConfigService,
    @InjectModel(Users) private readonly usersRepository: typeof Users,
    @InjectModel(Contacts) private readonly contactsRepository: typeof Contacts,
  ) {
    this.user = this.configService.get<string>('SIPUNI_USER');
    this.secret = this.configService.get<string>('SIPUNI_SECRET');
  }

  private generateHash(params: string[]): string {
    const hashString = [...params, this.secret].join('+');
    return crypto.createHash('md5').update(hashString).digest('hex');
  }

  async makeCall(contactId: number, phoneId: number | undefined, userId: number): Promise<SipuniResponse> {
    try {
      // Get user from database to check SIP ID
      const user = await this.usersRepository.findByPk(userId);
      
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      if (!user.sipId) {
        throw new HttpException(
          'SIP ID not configured for this user',
          HttpStatus.BAD_REQUEST
        );
      }

      // Get contact and their phone numbers
      const contact = await this.contactsRepository.findOne({
        where: { contactId },
        include: [{
          model: ContactPhones,
          where: phoneId ? { phoneId } : undefined,
          required: true
        }]
      });

      if (!contact) {
        throw new HttpException('Contact not found', HttpStatus.NOT_FOUND);
      }

      if (!contact.contactPhones?.length) {
        throw new HttpException(
          phoneId ? 'Specified phone number not found' : 'Contact has no phone numbers',
          HttpStatus.BAD_REQUEST
        );
      }

      const phoneNumber = contact.contactPhones[0].phoneNumber;
      
      // Format phone number (remove any non-digit characters and ensure it starts with 7)
      const formattedNumber = phoneNumber.replace(/\D/g, '').replace(/^8/, '7');
      
      // Default parameters
      const antiaon = '0'; // Don't hide city number
      const reverse = '0'; // Call internal number first

      // Generate hash using user's SIP ID
      const hash = this.generateHash([
        antiaon,
        formattedNumber,
        reverse,
        user.sipId,
        this.user
      ]);

      // Prepare request parameters
      const params = new URLSearchParams({
        user: this.user,
        phone: formattedNumber,
        sipnumber: user.sipId,
        antiaon,
        reverse,
        hash
      });

      // Make API call
      const response = await axios.post<SipuniResponse>(
        'https://sipuni.com/api/callback/call_number',
        params.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      if (!response.data.success) {
        this.logger.error('Sipuni API error:', response.data);
        throw new HttpException(
          response.data.message || 'Failed to initiate call',
          HttpStatus.BAD_REQUEST
        );
      }

      return response.data;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      if (axios.isAxiosError(error)) {
        this.logger.error('Sipuni API request failed:', error.response?.data);
        throw new HttpException(
          error.response?.data?.message || 'Failed to connect to Sipuni API',
          HttpStatus.BAD_GATEWAY
        );
      }
      this.logger.error('Failed to make call:', error);
      throw new HttpException(
        'Failed to initiate call',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async cancelCall(callbackId: string): Promise<SipuniResponse> {
    try {
      // Generate hash
      const hash = this.generateHash([
        callbackId,
        this.user
      ]);

      // Prepare request parameters
      const params = new URLSearchParams({
        user: this.user,
        callbackId,
        hash
      });

      // Make API call
      const response = await axios.post<SipuniResponse>(
        'https://sipuni.com/api/callback/cancel',
        params.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      if (!response.data.success) {
        this.logger.error('Sipuni API error:', response.data);
        throw new HttpException(
          response.data.message || 'Failed to cancel call',
          HttpStatus.BAD_REQUEST
        );
      }

      return response.data;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      if (axios.isAxiosError(error)) {
        this.logger.error('Sipuni API request failed:', error.response?.data);
        throw new HttpException(
          error.response?.data?.message || 'Failed to connect to Sipuni API',
          HttpStatus.BAD_GATEWAY
        );
      }
      this.logger.error('Failed to cancel call:', error);
      throw new HttpException(
        'Failed to cancel call',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
} 