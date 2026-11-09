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
import { paginationOptions } from 'src/utils/pagination';
import { RequirePermissions } from 'src/utils/permissions';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @RequirePermissions('categories:create')
  @UseGuards(RoleGuard)
  @UseInterceptors(FileInterceptor('image', imageMulterConfig))
  create(
    @Body() body: CreateCategoryDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.categoryService.create(body, image);
  }

  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.categoryService.findAll(paginationOptions(page, limit));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('categories:update')
  @UseGuards(RoleGuard)
  @UseInterceptors(FileInterceptor('image', imageMulterConfig))
  update(
    @Param('id') id: string,
    @Body() body: UpdateCategoryDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.categoryService.update(id, body, image);
  }

  @Delete(':id')
  @RequirePermissions('categories:delete')
  @UseGuards(RoleGuard)
  remove(@Param('id') id: string) {
    return this.categoryService.remove(id);
  }
}
