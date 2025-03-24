import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendOtp(email: string, otp: string) {
    try {
      const template = `
      <h1>Your OTP Code</h1>
      <p>Your OTP code is <b>${otp}</b></p>
      `;
      await this.mailerService.sendMail({
        to: email,
        subject: 'Your OTP Code',
        html: template,
      });
      console.log('OTP sent successfully!');
    } catch (error) {
      console.error('Error sending OTP:', error);
      throw new Error('Failed to send OTP');
    }
  }
}
