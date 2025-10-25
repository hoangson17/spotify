import { Body, Controller, Delete, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Artist } from 'src/entities/artist.entity';
import { Track } from 'src/entities/track.entity';
import { Repository } from 'typeorm';
import { ArtistsService } from './artists.service';

@Controller('artist-track')
export class ArtistTrackController {
    constructor(
        private artistService: ArtistsService,
    ) {}

    @Post('sync')
    sync(@Body() data: any) {
        return this.artistService.syncTracks(data.artistId, data.trackId);
    }

    @Post('create')
    create(@Body() data: any) {
        return this.artistService.addTracks(data.artistId, data.trackId);
    }

    @Delete('delete')
    delete(@Body() data: any) {
        return this.artistService.deleteTracks(data.artistId);
    }
}
