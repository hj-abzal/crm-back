import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client, LocalAuth, NoAuth } from 'whatsapp-web.js';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { log } from 'console';
import { AppGateway } from 'src/gateway/app.gateway';

@Injectable()
export class WhatsAppService implements OnModuleInit {
  private client: Client;
  private isReady = false;
  private latestQR: string | null = null;

  constructor(private appGateway: AppGateway) {
    console.log('WhatsAppService constructor');
    
    this.client = new Client({
      authStrategy: new NoAuth(),
      puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      }
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.client.on('qr', (qr) => {
      console.log('QR received:', qr);
      this.latestQR = qr;
      this.appGateway.handleWhatsAppQR(qr);
    });

    this.client.on('ready', () => {
      this.isReady = true;
      this.latestQR = null;
      this.appGateway.handleWhatsAppReady();
      console.log('WhatsApp client is ready!');
    });

    this.client.on('disconnected', () => {
      this.isReady = false;
      this.appGateway.handleWhatsAppDisconnected();
      console.log('WhatsApp client disconnected');
    });
  }

  async onModuleInit() {
    try {
      await this.client.initialize();
    } catch (error) {
      console.error('Failed to initialize WhatsApp client:', error);
    }
  }

  getIsReady(): boolean {
    return this.isReady;
  }

  getLatestQR(): string | null {
    return this.latestQR;
  }

  async sendMessage(phoneNumber: string, message: string): Promise<boolean> {
    try {
      if (!this.isReady) {
        throw new Error('WhatsApp client is not ready');
      }

      // Format phone number to ensure it has country code
      const formattedNumber = phoneNumber.includes('@c.us') 
        ? phoneNumber 
        : `${phoneNumber.replace(/[^\d]/g, '')}@c.us`;

      await this.client.sendMessage(formattedNumber, message);
      return true;
    } catch (error) {
      console.error('Failed to send WhatsApp message:', error);
      return false;
    }
  }
} 