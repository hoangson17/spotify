import { RequirePermissions } from 'src/utils/permissions';
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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { imageMulterConfig } from 'src/config/multer.config';
import { RoleGuard } from 'src/guards/role/role.guard';
import { AlbumService } from './album.service';
import { paginationOptions } from 'src/utils/pagination';
import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';

@Controller('album')
export class AlbumController {
  constructor(private readonly albumService: AlbumService) {}

  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.albumService.findAll(paginationOptions(page, limit));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.albumService.findOne(id);
  }

  @Get(':id/tracks')
  getTrackIsAlbum(@Param('id') id: string) {
    return this.albumService.findOne(id);
  }

  @Post()
  @RequirePermissions('albums:create')
  @UseGuards(RoleGuard)
  @UseInterceptors(FileInterceptor('cover_image', imageMulterConfig))
  create(
    @Body() data: CreateAlbumDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.albumService.create(data, file);
  }

  @Patch(':id')
  @RequirePermissions('albums:update')
  @UseGuards(RoleGuard)
  @UseInterceptors(FileInterceptor('cover_image', imageMulterConfig)) //avatar tên field trong request
  update(
    @Param('id') id: string,
    @Body() data: UpdateAlbumDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.albumService.update(id, data, file);
  }

  @Delete(':id')
  @RequirePermissions('albums:delete')
  @UseGuards(RoleGuard)
  delete(@Param('id') id: string) {
    return this.albumService.delete(id);
  }
}
