import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class PasswordResetMailService {
  constructor(private readonly mailer: MailerService) {}

  async sendResetCode(email: string, code: string) {
    await this.mailer.sendMail({
      to: email,
      subject: 'Recuperação de senha',
      template: 'password-reset',
      context: { code },
    });
  }
}
