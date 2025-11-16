import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export default class Mail {
  constructor(private readonly mailerService: MailerService) {}

  send<T>(to: string, subject: string, template: string, context?: T) {
    const options = {
      to,
      subject,
      template: process.cwd() + '/src/mail/templates/' + template,
      context,
    } as ISendMailOptions;
    return this.mailerService.sendMail(options);
  }
  
}
