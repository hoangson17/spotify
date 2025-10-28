import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { TrackService } from './track.service';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/config/multer.config';

@Controller('track')
export class TrackController {
  constructor(private readonly trackService: TrackService) {}

  @Get()
  findAll() {
    return this.trackService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.trackService.findOne(id);
  }

@Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'audio', maxCount: 1 },
        { name: 'image', maxCount: 1 },
      ],
      multerConfig,
    ),
  )
  create(
    @Body() data: any,
    @UploadedFiles()
    files: { audio?: Express.Multer.File[]; image?: Express.Multer.File[] },
  ) {
    const audio = files.audio?.[0];
    const image = files.image?.[0];
    return this.trackService.create(data, image, audio);
  }


  @Patch(':id')
  update(@Param('id') id: number, @Body() data: any) {
    return this.trackService.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.trackService.delete(id);
  }
}
