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

  @UseGuards(RoleGuard)
  @Get('lock')
  getUserLock() {
    return this.userService.getUserLock();
  }

  @Patch('restore/:id')
  @UseGuards(RoleGuard)
  restore(@Param('id') id: number) {
    return this.userService.restore(id);
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

  @Delete(':id')
  @UseGuards(RoleGuard)
  async removeUser(@Param('id') id: number) {
    return this.userService.deleteUser(id);
  }

  @Delete('hard-delete/:id')
  @UseGuards(RoleGuard)
  async hardDeleteUser(@Param('id') id: number) {
    return this.userService.hardDelete(id);
  }
}
