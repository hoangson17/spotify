import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/config/multer.config';
import { RoleGuard } from 'src/guards/role/role.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(RoleGuard)
  @Get('all')
  getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('avatar', multerConfig))
  async update(
    @Param('id') id: number,
    @Body() body: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.userService.update(id, body, file);
  }
}
