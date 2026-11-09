import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Put,
  Query,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { imageMulterConfig } from 'src/config/multer.config';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { RoleGuard } from 'src/guards/role/role.guard';
import { UserService } from './user.service';
import { RequirePermissions } from 'src/utils/permissions';
import { paginationOptions } from 'src/utils/pagination';
import { SetPermissionsDto } from './dto/set-permissions.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(RoleGuard)
  @Get('all')
  @RequirePermissions('users:read')
  getAllUsers(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.userService.getAllUsers(paginationOptions(page, limit));
  }

  @UseGuards(RoleGuard)
  @Get('lock')
  @RequirePermissions('users:read')
  getUserLock(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.userService.getUserLock(paginationOptions(page, limit));
  }

  @Patch('restore/:id')
  @RequirePermissions('users:restore')
  @UseGuards(RoleGuard)
  restore(@Param('id') id: string, @Request() req: any) {
    return this.userService.restore(id, req.user);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('avatar', imageMulterConfig))
  async update(
    @Param('id') id: string,
    @Body() body: UpdateUserDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    return this.userService.update(id, body, file, req.user);
  }

  @Delete(':id')
  @RequirePermissions('users:lock')
  @UseGuards(RoleGuard)
  async removeUser(@Param('id') id: string, @Request() req: any) {
    return this.userService.deleteUser(id, req.user);
  }

  @Delete('hard-delete/:id')
  @RequirePermissions('users:delete')
  @UseGuards(RoleGuard)
  async hardDeleteUser(@Param('id') id: string, @Request() req: any) {
    return this.userService.hardDelete(id, req.user);
  }

  @Get('permission-catalog')
  @UseGuards(RoleGuard)
  @RequirePermissions('rbac:manage')
  permissionCatalog() {
    return this.userService.permissionCatalog();
  }

  @Get('admins')
  @UseGuards(RoleGuard)
  @RequirePermissions('rbac:manage')
  admins(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.userService.getAdmins(paginationOptions(page, limit));
  }

  @Put(':id/permissions')
  @UseGuards(RoleGuard)
  @RequirePermissions('rbac:manage')
  setPermissions(
    @Param('id') id: string,
    @Body() body: SetPermissionsDto,
    @Request() req: any,
  ) {
    return this.userService.setPermissions(id, body, req.user);
  }
}
