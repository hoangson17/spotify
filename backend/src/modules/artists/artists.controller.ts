import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ArtistsService } from './artists.service';

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
  create(@Body() data: any) {
    return this.artistsService.create(data);
  }

  @Patch('/:id')
  update(@Param('id') id: number, @Body() data: any) {
    return this.artistsService.update(id, data);
  }

  @Patch('/:id')
  delete(@Param('id') id: number) {
    return this.artistsService.delete(id);
  }

  @Post('bulk')
  createMany(@Body() artists: any[]) {
    return this.artistsService.createMany(artists);
  }
}
