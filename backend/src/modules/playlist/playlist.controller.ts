import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { PlaylistService } from './playlist.service';

@Controller('playlist')
export class PlaylistController {
  constructor(private readonly playlistService: PlaylistService) {}

  @Get()
  findAll() {
    return this.playlistService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.playlistService.findOne(id);
  }

  @Post()
  create(@Body() data: any) {
    return this.playlistService.create(data);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() data: any) {
    return this.playlistService.update(id, data);
  }
}
