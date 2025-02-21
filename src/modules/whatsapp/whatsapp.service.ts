import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client, NoAuth } from 'whatsapp-web.js';
import { AppGateway } from 'src/gateway/app.gateway';

interface WhatsAppClient {
  client: Client;
  isReady: boolean;
  latestQR: string | null;
}

@Injectable()
export class WhatsAppService implements OnModuleInit {
  private clients: Map<string, WhatsAppClient> = new Map();

  constructor(private appGateway: AppGateway) {
    console.log('WhatsAppService constructor');
  }

  private createClient(userId: string): WhatsAppClient {
    const client = new Client({
      authStrategy: new NoAuth(),
      puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      }
    });

    const whatsAppClient: WhatsAppClient = {
      client,
      isReady: false,
      latestQR: null,
    };

    this.setupEventListeners(userId, whatsAppClient);
    return whatsAppClient;
  }

  private setupEventListeners(userId: string, whatsAppClient: WhatsAppClient) {
    whatsAppClient.client.on('qr', (qr) => {
      console.log(`QR received for user ${userId}:`, qr);
      whatsAppClient.latestQR = qr;
      this.appGateway.handleWhatsAppQR(qr, userId);
    });

    whatsAppClient.client.on('ready', () => {
      whatsAppClient.isReady = true;
      whatsAppClient.latestQR = null;
      this.appGateway.handleWhatsAppReady(userId);
      console.log(`WhatsApp client for user ${userId} is ready!`);
    });

    whatsAppClient.client.on('disconnected', () => {
      whatsAppClient.isReady = false;
      this.appGateway.handleWhatsAppDisconnected(userId);
      console.log(`WhatsApp client for user ${userId} disconnected`);
      // Remove the client instance when disconnected
      this.clients.delete(userId);
    });
  }

  async initializeClient(userId: string): Promise<void> {
    if (this.clients.has(userId)) {
      throw new Error('WhatsApp client already exists for this user');
    }

    const whatsAppClient = this.createClient(userId);
    this.clients.set(userId, whatsAppClient);

    try {
      await whatsAppClient.client.initialize();
    } catch (error) {
      this.clients.delete(userId);
      console.error(`Failed to initialize WhatsApp client for user ${userId}:`, error);
      throw error;
    }
  }

  async onModuleInit() {
    // No automatic initialization needed anymore as clients are created per user
  }

  getIsReady(userId: string): boolean {
    return this.clients.get(userId)?.isReady ?? false;
  }

  getLatestQR(userId: string): string | null {
    return this.clients.get(userId)?.latestQR ?? null;
  }

  async sendMessage(userId: string, phoneNumber: string, message: string): Promise<boolean> {
    try {
      const whatsAppClient = this.clients.get(userId);
      if (!whatsAppClient || !whatsAppClient.isReady) {
        throw new Error('WhatsApp client is not ready or not found for this user');
      }

      // Format phone number to ensure it has country code
      const formattedNumber = phoneNumber.includes('@c.us') 
        ? phoneNumber 
        : `${phoneNumber.replace(/[^\d]/g, '')}@c.us`;

      await whatsAppClient.client.sendMessage(formattedNumber, message);
      return true;
    } catch (error) {
      console.log('Failed to send WhatsApp message:', error);
      return false;
    }
  }

  async disconnectClient(userId: string): Promise<void> {
    const whatsAppClient = this.clients.get(userId);
    if (whatsAppClient) {
      await whatsAppClient.client.destroy();
      this.clients.delete(userId);
    }
  }

  getActiveClients(): string[] {
    return Array.from(this.clients.keys());
  }
} 
