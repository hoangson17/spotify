import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/entities/category.entity';
import { categoryFields } from 'src/utils/catalog-input';
import { entityId } from 'src/utils/input';
import {
  paginated,
  PaginationOptions,
  paginationOptions,
} from 'src/utils/pagination';
import { commitUpload, removeUpload } from 'src/utils/uploads';
import { Repository } from 'typeorm';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(body: unknown, image?: Express.Multer.File) {
    const data = categoryFields(body, true);
    const category = this.categoryRepository.create({
      ...data,
      ...(image ? { image_url: `/uploads/images/${image.filename}` } : {}),
    });
    const saved = await this.categoryRepository.save(category);
    commitUpload(image);
    return saved;
  }

  async findAll(options: PaginationOptions = paginationOptions()) {
    return paginated(
      await this.categoryRepository.findAndCount({
        relations: ['tracks'],
        order: { name: 'ASC' },
        skip: options.skip,
        take: options.limit,
      }),
      options,
    );
  }

  async findOne(id: string) {
    const category = await this.categoryRepository.findOne({
      where: { id: entityId(id) },
      relations: ['tracks', 'tracks.artists'],
    });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async update(id: string, body: unknown, image?: Express.Multer.File) {
    const category = await this.findOne(id);
    const data = categoryFields(body);
    const oldImage = category.image_url;
    Object.assign(
      category,
      data,
      image ? { image_url: `/uploads/images/${image.filename}` } : {},
    );
    const saved = await this.categoryRepository.save(category);
    commitUpload(image);
    if (image) await removeUpload(oldImage);
    return saved;
  }

  async remove(id: string) {
    const category = await this.findOne(id);
    await this.categoryRepository.softRemove(category);
    await removeUpload(category.image_url);
    return { success: true };
  }
}
