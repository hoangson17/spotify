import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { AlbumService } from './album.service';

@Controller('album')
export class AlbumController {
  constructor(private readonly albumService: AlbumService) {}

  @Get()
  findAll() {
    return this.albumService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.albumService.findOne(id);
  }

  @Get(':id/tracks')
  getTrackIsAlbum(@Param('id') id: number) {
    return this.albumService.findOne(id);
  }
  
  @Post()
  create(@Body() data: any) {
    return this.albumService.create(data);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() data: any) {
    return this.albumService.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.albumService.delete(id);
  }


}
