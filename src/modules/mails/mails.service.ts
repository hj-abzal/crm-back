import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { Users } from '../users/users.model';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailsService {
  private readonly logger = new Logger(MailsService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendEmailVerification(user: Users) {
    const backUrl = this.configService.get<string>('BACK_URL');
    this.logger.log(`BACK_URL from ConfigService: ${backUrl}`);
    const to = user.email;
    const url = `${this.configService.get('BACK_URL')}/auth/confirm?code=${
      user.code
    }&email=${to}`;
    try {
      await this.mailerService.sendMail({
        to,
        subject: 'Welcome to CRM! Confirm your Email',
        template: 'confirmation',
        context: {
          name: user.firstName,
          url,
        },
      });
      this.logger.log('Sent email to:' + to);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error);

      throw new Error('Failed to send email');
    }
  }
}
