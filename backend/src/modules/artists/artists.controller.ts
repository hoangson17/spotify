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
import { ArtistsService } from './artists.service';
import { paginationOptions } from 'src/utils/pagination';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';

@Controller('artists')
export class ArtistsController {
  constructor(private readonly artistsService: ArtistsService) {}

  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.artistsService.findAll(paginationOptions(page, limit));
  }

  @Get('/:id')
  findOne(@Param('id') id: string) {
    return this.artistsService.findOne(id);
  }

  @Post()
  @RequirePermissions('artists:create')
  @UseGuards(RoleGuard)
  @UseInterceptors(FileInterceptor('avatar', imageMulterConfig))
  create(
    @Body() data: CreateArtistDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.artistsService.create(data, file);
  }

  @Patch('/:id')
  @RequirePermissions('artists:update')
  @UseGuards(RoleGuard)
  @UseInterceptors(FileInterceptor('avatar', imageMulterConfig))
  update(
    @Param('id') id: string,
    @Body() data: UpdateArtistDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.artistsService.update(id, data, file);
  }

  @Delete('/:id')
  @RequirePermissions('artists:delete')
  @UseGuards(RoleGuard)
  delete(@Param('id') id: string) {
    return this.artistsService.delete(id);
  }

  @Post('bulk')
  @RequirePermissions('artists:create')
  @UseGuards(RoleGuard)
  createMany(@Body() artists: CreateArtistDto[]) {
    return this.artistsService.createMany(artists);
  }
}
