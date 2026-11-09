import { RequirePermissions } from 'src/utils/permissions';
import { Body, Controller, Delete, Post, UseGuards } from '@nestjs/common';
import { RoleGuard } from 'src/guards/role/role.guard';
import { allowedFields, entityId, trackIds } from 'src/utils/input';
import { ArtistsService } from './artists.service';
import { ArtistTracksDto } from './dto/artist-tracks.dto';

@Controller('artist-track')
@RequirePermissions('artists:update')
@UseGuards(RoleGuard)
export class ArtistTrackController {
  constructor(private artistService: ArtistsService) {}

  @Post('sync')
  sync(@Body() data: ArtistTracksDto) {
    allowedFields(data, ['artistId', 'trackId']);
    return this.artistService.syncTracks(
      entityId(data.artistId),
      trackIds(data.trackId),
    );
  }

  @Post('create')
  create(@Body() data: ArtistTracksDto) {
    allowedFields(data, ['artistId', 'trackId']);
    return this.artistService.addTracks(
      entityId(data.artistId),
      trackIds(data.trackId),
    );
  }

  @Delete('delete')
  delete(@Body() data: ArtistTracksDto) {
    allowedFields(data, ['artistId']);
    return this.artistService.deleteTracks(entityId(data.artistId));
  }
}
