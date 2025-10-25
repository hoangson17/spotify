import { Module } from '@nestjs/common';
import { TrackService } from './track.service';
import { TrackController } from './track.controller';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Track } from 'src/entities/track.entity';
import { Artist } from 'src/entities/artist.entity';
import { Album } from 'src/entities/album.entity';

@Module({
  controllers: [TrackController],
  providers: [TrackService],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    TypeOrmModule.forFeature([Track,Artist,Album])
  ],
})
export class TrackModule {}
