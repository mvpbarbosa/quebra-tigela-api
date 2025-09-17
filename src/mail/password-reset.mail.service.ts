import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class PasswordResetMailService {
  constructor(private readonly mailer: MailerService) {}

  async sendResetCode(email: string, code: string) {
    console.log('Passei', email, code);
    await this.mailer.sendMail({
      to: email,
      subject: 'Recuperação de senha',
      template: 'password-reset', // handlebars template
      context: { code },
    });
  }
}
