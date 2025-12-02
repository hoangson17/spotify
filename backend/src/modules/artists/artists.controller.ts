import { Body, Controller, Delete, Get, Param, Patch, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ArtistsService } from './artists.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/config/multer.config';

@Controller('artists')
export class ArtistsController {
  constructor(private readonly artistsService: ArtistsService) {}

  @Get()
  findAll() {
    return this.artistsService.findAll();
  }

  @Get('/:id')
  findOne(@Param('id') id: number) {
    return this.artistsService.findOne(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('avatar',multerConfig))
  create(@Body() data: any,@UploadedFile() file: Express.Multer.File) {
    return this.artistsService.create(data,file);
  }

  @Patch('/:id')
  @UseInterceptors(FileInterceptor('avatar',multerConfig))
  update(@Param('id') id: number, @Body() data: any,@UploadedFile() file: Express.Multer.File) {
    return this.artistsService.update(id, data, file);
  }

  @Delete('/:id')
  delete(@Param('id') id: number) {
    return this.artistsService.delete(id);
  }

  @Post('bulk')
  createMany(@Body() artists: any[]) {
    return this.artistsService.createMany(artists);
  }
}
