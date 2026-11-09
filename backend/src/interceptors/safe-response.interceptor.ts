import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, map } from 'rxjs';
import { cleanupUpload, uploadCommitted } from 'src/utils/uploads';

export function safeResponse(value: any): any {
  if (Array.isArray(value)) return value.map(safeResponse);
  if (
    !value ||
    typeof value !== 'object' ||
    value instanceof Date ||
    Buffer.isBuffer(value)
  )
    return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !['password', 'jti', 'exp', 'sid'].includes(key))
      .map(([key, item]) => [key, safeResponse(item)]),
  );
}

@Injectable()
export class SafeResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      map(safeResponse),
      catchError(async (error) => {
        const req = context.switchToHttp().getRequest();
        const files: Express.Multer.File[] = req.file ? [req.file] : [];
        if (Array.isArray(req.files)) files.push(...req.files);
        else if (req.files)
          files.push(
            ...Object.values(
              req.files as Record<string, Express.Multer.File[]>,
            ).flat(),
          );
        await Promise.allSettled(files.filter(file => !uploadCommitted(file)).map((file) => cleanupUpload(file.path)));
        throw error;
      }),
    );
  }
}
