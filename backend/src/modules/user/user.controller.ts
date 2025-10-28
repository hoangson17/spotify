import { Body, Controller, Delete, Param, Patch, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/config/multer.config';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

@Patch(':id')
  @UseInterceptors(FileInterceptor('avatar', multerConfig))
  async update(
    @Param('id') id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    return this.userService.update(id, body, file);
  }

}
