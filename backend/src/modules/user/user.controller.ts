import { Body, Controller, Delete, Patch, Post } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user-tracks')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Patch('update')
  async update(@Body() body: any) {
    return this.userService.update(body.id, body.data);
  }

}
