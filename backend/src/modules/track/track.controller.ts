import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { TrackService } from './track.service';

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
  create(@Body() data: any) {
    return this.trackService.create(data);
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
