import { Body, Controller, Post } from '@nestjs/common';
import { PlaylistService } from './playlist.service';

@Controller('playlist-track')
export class PlaylistTrackController {
    constructor(
        private playlistService: PlaylistService
    ) {}

    @Post('sync')
    syncTrack(@Body() body: any) {
        return this.playlistService.syncTrack(body.playlistId, body.trackIds);
    }

    @Post('add')
    addTrack(@Body() body: any) {
        return this.playlistService.addTrack(body.playlistId, body.trackIds);
    }

    @Post('delete')
    deleteTracks(@Body() body: any) {
        return this.playlistService.deleteTracks(body.playlistId);
    }
}
