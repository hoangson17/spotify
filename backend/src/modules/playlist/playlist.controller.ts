import { Body, Controller, Delete, Get, Param, Patch, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { PlaylistService } from './playlist.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/config/multer.config';

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
  @UseInterceptors(FileInterceptor('cover_image',multerConfig))
  create(@Body() data: any, @UploadedFile() file: Express.Multer.File) {
    return this.playlistService.create(data,file);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('cover_image',multerConfig))
  update(@Param('id') id: number, @Body() data: any, @UploadedFile() file: Express.Multer.File) {
    return this.playlistService.update(id, data, file);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.playlistService.delete(id);
  }
}
