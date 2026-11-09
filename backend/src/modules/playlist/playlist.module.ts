import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Playlist } from 'src/entities/playlist.entity';
import { Track } from 'src/entities/track.entity';
import { User } from 'src/entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { PlaylistTrackController } from './playlist-track.controller';
import { PlaylistController } from './playlist.controller';
import { PlaylistService } from './playlist.service';

@Module({
  controllers: [PlaylistController, PlaylistTrackController],
  providers: [PlaylistService],
  imports: [
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forFeature([Playlist, User, Track]),
  ],
})
export class PlaylistModule {}
