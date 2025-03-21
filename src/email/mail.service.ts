import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendOtp(email: string, otp: string) {
    try {
      console.log({ email, otp });
      await this.mailerService.sendMail({
        to: email,
        subject: 'Your OTP Code',
        template: './otp',
        context: {
          otp,
        },
      });
      console.log('OTP sent successfully!');
    } catch (error) {
      console.error('Error sending OTP:', error);
      throw new Error('Failed to send OTP');
    }
  }
}
