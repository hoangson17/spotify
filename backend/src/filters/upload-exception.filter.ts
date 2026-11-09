import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';
import type { HttpServer } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { getUploadLimits, uploadLimitMessage } from 'src/config/upload-limits';

@Catch()
export class UploadExceptionFilter extends BaseExceptionFilter {
  constructor(private readonly adapter: HttpServer) {
    super(adapter);
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const request = host.switchToHttp().getRequest();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : (exception as { status?: number })?.status;
    if (
      status !== 413 ||
      !String(request.headers['content-type']).startsWith('multipart/form-data')
    ) {
      return super.catch(exception, host);
    }
    this.adapter.reply(
      host.switchToHttp().getResponse(),
      {
        statusCode: 413,
        error: 'Payload Too Large',
        message: uploadLimitMessage(),
        limits: getUploadLimits(),
      },
      413,
    );
  }
}
