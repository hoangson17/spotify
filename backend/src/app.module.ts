import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { RedisModule } from '@nestjs-modules/ioredis';
import { ArtistsModule } from './modules/artists/artists.module';
import { PlaylistModule } from './modules/playlist/playlist.module';
import { AlbumModule } from './modules/album/album.module';
import { TrackModule } from './modules/track/track.module';
import { UserModule } from './modules/user/user.module';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { SearchModule } from './modules/search/search.module';
import { BullModule } from '@nestjs/bullmq';
import Mail from './utils/mail';
import { EmailConsumer } from './consumer/email.consumer';
import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: process.env.DB_PORT as unknown as number,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize:
        process.env.DB_NODE_ENV === 'development' || !process.env.DB_NODE_ENV,
      logging: true,
      autoLoadEntities: true,
    }),
    RedisModule.forRoot({
      type: 'single',
      url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
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
        host: 'localhost',
        port: 6379,
      },
    }),
    AuthModule,
    ArtistsModule,
    PlaylistModule,
    AlbumModule,
    TrackModule,
    UserModule,
    SearchModule,
  ],
  controllers: [AppController],
  providers: [AppService, Mail, EmailConsumer],
})
export class AppModule {}
