import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { imageMulterConfig } from 'src/config/multer.config';
import { AuthGuard, OptionalAuthGuard } from 'src/guards/auth/auth.guard';
import { PlaylistService } from './playlist.service';
import { paginationOptions } from 'src/utils/pagination';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';

@Controller('playlist')
export class PlaylistController {
  constructor(private readonly playlistService: PlaylistService) {}

  @Get()
  @UseGuards(OptionalAuthGuard)
  findAll(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.playlistService.findAll(
      req.user,
      paginationOptions(page, limit),
    );
  }

  @Get(':id')
  @UseGuards(OptionalAuthGuard)
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.playlistService.findOne(id, req.user);
  }

  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('cover_image', imageMulterConfig))
  create(
    @Body() data: CreatePlaylistDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    return this.playlistService.create(data, file, req.user);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('cover_image', imageMulterConfig))
  update(
    @Param('id') id: string,
    @Body() data: UpdatePlaylistDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    return this.playlistService.update(id, data, file, req.user);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  delete(@Param('id') id: string, @Request() req: any) {
    return this.playlistService.delete(id, req.user);
  }
}
