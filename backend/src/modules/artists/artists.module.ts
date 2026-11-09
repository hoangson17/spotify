import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Artist } from 'src/entities/artist.entity';
import { Track } from 'src/entities/track.entity';
import { AuthModule } from '../auth/auth.module';
import { ArtistTrackController } from './artist-track.controller';
import { ArtistsController } from './artists.controller';
import { ArtistsService } from './artists.service';

@Module({
  controllers: [ArtistsController, ArtistTrackController],
  providers: [ArtistsService],
  imports: [
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forFeature([Artist, Track]),
  ],
})
export class ArtistsModule {}
