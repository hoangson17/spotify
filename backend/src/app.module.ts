import { getRedisConnectionToken, RedisModule } from '@nestjs-modules/ioredis';
import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { join } from 'path';
import Redis from 'ioredis';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CacheModule } from './cache/cache.module';
import { getThrottlerConfig } from './config/throttler.config';
import { EmailConsumer } from './consumer/email.consumer';
import { AlbumModule } from './modules/album/album.module';
import { ArtistsModule } from './modules/artists/artists.module';
import { AuthModule } from './modules/auth/auth.module';
import { PlaylistModule } from './modules/playlist/playlist.module';
import { SearchModule } from './modules/search/search.module';
import { TrackModule } from './modules/track/track.module';
import { RedisThrottlerStorage } from './throttler/redis-throttler.storage';
import { UserModule } from './modules/user/user.module';
import { CategoryModule } from './modules/category/category.module';
import Mail from './utils/mail';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RedisModule.forRoot({
      type: 'single',
      url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
    }),
    ThrottlerModule.forRootAsync({
      inject: [getRedisConnectionToken()],
      useFactory: (redis: Redis) => ({
        ...getThrottlerConfig(),
        storage: new RedisThrottlerStorage(redis),
      }),
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.DB_NODE_ENV === 'development',
      logging: process.env.DB_NODE_ENV === 'development',
      autoLoadEntities: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    MailerModule.forRoot({
      transport: `smtps://${process.env.MAIL_USERNAME}:${process.env.MAIL_PASSWORD}@${process.env.MAIL_HOST}`,
      defaults: {
        from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM}>`,
      },
      template: {
        dir: __dirname + '/mail/templates',
        adapter: new EjsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT || 6379),
      },
    }),
    CacheModule,
    AuthModule,
    ArtistsModule,
    PlaylistModule,
    AlbumModule,
    TrackModule,
    UserModule,
    SearchModule,
    CategoryModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    Mail,
    EmailConsumer,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
