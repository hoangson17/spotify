import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { SafeResponseInterceptor } from './interceptors/safe-response.interceptor';
import { IdPipe } from './pipes/id.pipe';
import { UploadExceptionFilter } from './filters/upload-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  if (process.env.TRUST_PROXY === 'loopback') {
    app.set('trust proxy', 'loopback');
  }
  app.useGlobalInterceptors(new SafeResponseInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
    new IdPipe(),
  );
  app.useGlobalFilters(new UploadExceptionFilter(app.getHttpAdapter()));
  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
