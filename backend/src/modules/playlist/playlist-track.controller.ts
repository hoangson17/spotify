import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { allowedFields, assertOwner, entityId } from 'src/utils/input';
import { PlaylistService } from './playlist.service';
import { PlaylistTracksDto } from './dto/playlist-tracks.dto';

@Controller('playlist-track')
@UseGuards(AuthGuard)
export class PlaylistTrackController {
  constructor(private readonly playlistService: PlaylistService) {}

  private validate(
    userId: string,
    body: PlaylistTracksDto,
    actor: any,
    allowTracks = true,
  ) {
    assertOwner(actor, entityId(userId));
    allowedFields(body, ['playlistId', ...(allowTracks ? ['trackIds'] : [])]);
    return entityId(body.playlistId);
  }

  @Post('sync/:id')
  syncTrack(
    @Param('id') id: string,
    @Body() body: PlaylistTracksDto,
    @Request() req: any,
  ) {
    return this.playlistService.syncTrack(
      req.user,
      this.validate(id, body, req.user),
      body.trackIds ?? [],
    );
  }

  @Post('add/:id')
  addTrack(
    @Param('id') id: string,
    @Body() body: PlaylistTracksDto,
    @Request() req: any,
  ) {
    return this.playlistService.addTrack(
      req.user,
      this.validate(id, body, req.user),
      body.trackIds ?? [],
    );
  }

  @Patch('remove/:id')
  removeTracks(
    @Param('id') id: string,
    @Body() body: PlaylistTracksDto,
    @Request() req: any,
  ) {
    return this.playlistService.removeTracks(
      req.user,
      this.validate(id, body, req.user),
      body.trackIds ?? [],
    );
  }

  @Delete('delete/:id')
  deleteTracks(
    @Param('id') id: string,
    @Body() body: PlaylistTracksDto,
    @Request() req: any,
  ) {
    return this.playlistService.syncTrack(
      req.user,
      this.validate(id, body, req.user, false),
      [],
    );
  }
}
