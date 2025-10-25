import { Module } from '@nestjs/common';
import { ArtistsService } from './artists.service';
import { ArtistsController } from './artists.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Artist } from 'src/entities/artist.entity';
import { ConfigModule } from '@nestjs/config';
import { ArtistTrackController } from './artist-track.controller';
import { Track } from 'src/entities/track.entity';

@Module({
  controllers: [ArtistsController, ArtistTrackController],
  providers: [ArtistsService],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    TypeOrmModule.forFeature([Artist,Track]),
  ],
})
export class ArtistsModule {}
