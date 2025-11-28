import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { TrackService } from './track.service';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { multerConfig } from 'src/config/multer.config';
import { RoleGuard } from 'src/guards/role/role.guard';
import { AuthGuard } from 'src/guards/auth/auth.guard';

@Controller('track')
export class TrackController {
  constructor(private readonly trackService: TrackService) {}

  @Get()
  findAll() {
    return this.trackService.findAll();
  }

  @Get('search')
  search(@Query('keyword') keyword: string) {
    return this.trackService.search(keyword);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.trackService.findOne(id);
  }

  @UseGuards(RoleGuard)
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

  @UseGuards(RoleGuard)
  @Patch(':id')
  update(@Param('id') id: number, @Body() data: any) {
    return this.trackService.update(id, data);
  }

  @UseGuards(RoleGuard)
  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.trackService.delete(id);
  }
}
