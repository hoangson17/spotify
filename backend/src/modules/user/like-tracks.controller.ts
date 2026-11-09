import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { allowedFields, assertOwner, entityId } from 'src/utils/input';
import { UserService } from './user.service';
import { paginationOptions } from 'src/utils/pagination';
import { UserTracksDto } from './dto/user-tracks.dto';

@Controller('like-tracks')
@UseGuards(AuthGuard)
export class LikeTracksController {
  constructor(private readonly userService: UserService) {}

  @Get(':userId')
  async getTracks(
    @Param('userId') userId: string,
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    userId = entityId(userId);
    assertOwner(req.user, userId);
    return this.userService.getTracks(userId, paginationOptions(page, limit));
  }

  @Post('sync')
  async syncTrack(@Body() body: UserTracksDto, @Request() req: any) {
    allowedFields(body, ['userId', 'trackIds']);
    body.userId = entityId(body.userId);
    assertOwner(req.user, body.userId);
    return this.userService.syncTrack(body.userId, body.trackIds);
  }

  @Post('add')
  async addTracks(@Body() body: UserTracksDto, @Request() req: any) {
    allowedFields(body, ['userId', 'trackIds']);
    body.userId = entityId(body.userId);
    assertOwner(req.user, body.userId);
    return this.userService.addTracks(body.userId, body.trackIds);
  }

  @Delete('delete')
  async deleteTracks(@Body() body: UserTracksDto, @Request() req: any) {
    allowedFields(body, ['userId', 'trackIds']);
    body.userId = entityId(body.userId);
    assertOwner(req.user, body.userId);
    return this.userService.deleteTracks(body.userId, body.trackIds);
  }
}
