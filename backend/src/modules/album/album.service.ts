import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Album } from 'src/entities/album.entity';
import { albumFields } from 'src/utils/catalog-input';
import { commitUpload, removeUpload } from 'src/utils/uploads';
import { Repository } from 'typeorm';
import {
  paginated,
  PaginationOptions,
  paginationOptions,
} from 'src/utils/pagination';

@Injectable()
export class AlbumService {
  constructor(
    @InjectRepository(Album) private albumRepository: Repository<Album>,
  ) {}

  async findAll(options: PaginationOptions = paginationOptions()) {
    return paginated(
      await this.albumRepository.findAndCount({
        relations: ['artist', 'tracks'],
        order: { created_at: 'DESC' },
        skip: options.skip,
        take: options.limit,
      }),
      options,
    );
  }

  findOne(id: string) {
    return this.albumRepository.findOne({
      where: { id },
      relations: ['artist', 'tracks'],
    });
  }

  async create(data: any, file?: Express.Multer.File) {
    data = albumFields(data, true);
    if (file) {
      if (file.mimetype.startsWith('image/'))
        data.cover_image = `/uploads/images/${file.filename}`;
      else throw new Error('Invalid file type');
    }
    const saved = await this.albumRepository.save(data);
    commitUpload(file);
    return saved;
  }

  async update(id: string, data: any, file?: Express.Multer.File) {
    data = albumFields(data);
    const album = await this.albumRepository.findOne({ where: { id } });
    if (!album) throw new NotFoundException('Album not found');
    if (file) {
      if (file.mimetype.startsWith('image/'))
        data.cover_image = `/uploads/images/${file.filename}`;
      else throw new Error('Invalid file type');
    }
    await this.albumRepository.update(id, data);
    commitUpload(file);
    if (file) await removeUpload(album.cover_image);
    return this.findOne(id);
  }

  delete(id: string) {
    return this.albumRepository.delete(id);
  }
}
