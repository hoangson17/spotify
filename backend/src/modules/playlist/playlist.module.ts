import { Module } from '@nestjs/common';
import { PlaylistService } from './playlist.service';
import { PlaylistController } from './playlist.controller';
import { ConfigModule } from '@nestjs/config';
import { Playlist } from 'src/entities/playlist.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { PlaylistTrackController } from './playlist-track.controller';
import { Track } from 'src/entities/track.entity';

@Module({
  controllers: [PlaylistController, PlaylistTrackController],
  providers: [PlaylistService],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    TypeOrmModule.forFeature([Playlist,User,Track])
  ],
})
export class PlaylistModule {}
