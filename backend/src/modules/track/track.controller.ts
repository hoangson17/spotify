import { RequirePermissions } from 'src/utils/permissions';
import { UploadSizeInterceptor } from 'src/interceptors/upload-size.interceptor';
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
import { paginationOptions } from 'src/utils/pagination';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { entityId } from 'src/utils/input';

@Controller('track')
export class TrackController {
  constructor(private readonly trackService: TrackService) {}

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    const options = paginationOptions(page, limit);
    return categoryId
      ? this.trackService.findAll(options, entityId(categoryId))
      : this.trackService.findAll(options);
  }

  @Get('search')
  search(
    @Query('keyword') keyword: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.trackService.search(keyword, paginationOptions(page, limit));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.trackService.findOne(id);
  }

  @UseGuards(RoleGuard)
  @Post()
  @RequirePermissions('tracks:create')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'audio', maxCount: 1 },
        { name: 'image', maxCount: 1 },
      ],
      multerConfig,
    ),
    UploadSizeInterceptor,
  )
  create(
    @Body() data: CreateTrackDto,
    @UploadedFiles()
    files: { audio?: Express.Multer.File[]; image?: Express.Multer.File[] },
  ) {
    const audio = files.audio?.[0];
    const image = files.image?.[0];
    return this.trackService.create(data, image, audio);
  }

  @UseGuards(RoleGuard)
  @Patch(':id')
  @RequirePermissions('tracks:update')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'audio', maxCount: 1 },
        { name: 'image', maxCount: 1 },
      ],
      multerConfig,
    ),
    UploadSizeInterceptor,
  )
  update(
    @Param('id') id: string,
    @Body() data: UpdateTrackDto,
    @UploadedFiles()
    files: { audio?: Express.Multer.File[]; image?: Express.Multer.File[] },
  ) {
    return this.trackService.update(
      id,
      data,
      files.image?.[0],
      files.audio?.[0],
    );
  }

  @UseGuards(RoleGuard)
  @Delete(':id')
  @RequirePermissions('tracks:delete')
  delete(@Param('id') id: string) {
    return this.trackService.delete(id);
  }
}
