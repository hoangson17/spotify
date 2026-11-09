import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  PayloadTooLargeException,
} from '@nestjs/common';
import { getUploadLimits, uploadLimitMessage } from 'src/config/upload-limits';

@Injectable()
export class UploadSizeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const files = context.switchToHttp().getRequest().files as
      | Record<string, Express.Multer.File[]>
      | undefined;
    const limits = getUploadLimits();
    for (const file of Object.values(files ?? {}).flat()) {
      const maximum =
        file.fieldname === 'audio'
          ? limits.audioMaxBytes
          : limits.imageMaxBytes;
      if (file.size > maximum)
        throw new PayloadTooLargeException(uploadLimitMessage());
    }
    return next.handle();
  }
}
