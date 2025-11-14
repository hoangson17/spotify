import { Body, Controller, Param, Post } from '@nestjs/common';
import { PlaylistService } from './playlist.service';

@Controller('playlist-track')
export class PlaylistTrackController {
    constructor(
        private playlistService: PlaylistService
    ) {}

    @Post('sync/:id')
    syncTrack(@Param('id') id: number,@Body() body: any) {
        return this.playlistService.syncTrack(id,body.playlistId, body.trackIds);
    }

    @Post('add/:id')
    addTrack(@Param('id') id: number,@Body() body: any) {
        return this.playlistService.addTrack(id,body.playlistId, body.trackIds);
    }

    @Post('delete/:id')
    deleteTracks(@Param('id') id: number, @Body() body: any) {
        return this.playlistService.deleteTracks(id,body.playlistId);
    }
}
