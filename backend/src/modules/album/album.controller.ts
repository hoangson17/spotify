import { Body, Controller, Delete, Get, Param, Patch, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AlbumService } from './album.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/config/multer.config';

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
  @UseInterceptors(FileInterceptor('cover_image', multerConfig))
  create(@Body() data: any, @UploadedFile() file: Express.Multer.File) {
    return this.albumService.create(data, file);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('cover_image', multerConfig)) //avatar tên field trong request
  update(@Param('id') id: number, @Body() data: any, @UploadedFile() file: Express.Multer.File) {
    return this.albumService.update(id, data, file);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.albumService.delete(id);
  }


}
