import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { getUploadLimits } from './config/upload-limits';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('upload-limits')
  uploadLimits() {
    return getUploadLimits();
  }
}
