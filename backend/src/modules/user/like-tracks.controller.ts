import { Body, Controller, Delete, Post } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('like-tracks')
export class LikeTracksController {
    constructor(private readonly userService: UserService) {}
    
      @Post('sync')
      async syncTrack(@Body() body: any) {
        return this.userService.syncTrack(body.userId, body.trackIds);
      }
    
      @Post('add')
      async addTracks(@Body() body: any) {
        return this.userService.addTracks(body.userId, body.trackIds);
      }
    
      @Delete('delete')
      async deleteTracks(@Body() body: any) {
        return this.userService.deleteTracks(body.userId);
      }
}
