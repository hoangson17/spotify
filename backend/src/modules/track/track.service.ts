import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Track } from 'src/entities/track.entity';
import { Artist } from 'src/entities/artist.entity';
import { Category } from 'src/entities/category.entity';
import { trackFields } from 'src/utils/catalog-input';
import { commitUpload, removeUpload } from 'src/utils/uploads';
import { ILike, Repository } from 'typeorm';
import {
  paginated,
  PaginationOptions,
  paginationOptions,
} from 'src/utils/pagination';

@Injectable()
export class TrackService {
  constructor(
    @InjectRepository(Track) private trackRepository: Repository<Track>,
    @InjectRepository(Artist) private artistRepository: Repository<Artist>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async findAll(
    options: PaginationOptions = paginationOptions(),
    categoryId?: string,
  ) {
    return paginated(
      await this.trackRepository.findAndCount({
        where: categoryId ? { category: { id: categoryId } } : undefined,
        relations: ['album', 'artists', 'category'],
        order: { created_at: 'DESC' },
        skip: options.skip,
        take: options.limit,
      }),
      options,
    );
  }

  async findOne(id: string) {
    const track = await this.trackRepository.findOne({
      where: { id },
      relations: ['album', 'artists', 'category'],
    });
    if (!track) throw new NotFoundException('Track not found');
    return track;
  }

  private async media(
    image?: Express.Multer.File,
    audio?: Express.Multer.File,
  ) {
    const data: Partial<Track> = {};
    if (image) data.image_url = `/uploads/images/${image.filename}`;
    if (audio) {
      data.audio_url = `/uploads/audio/${audio.filename}`;
    }
    return data;
  }

  async create(
    body: unknown,
    image?: Express.Multer.File,
    audio?: Express.Multer.File,
  ) {
    const data = trackFields(body, true);
    await Promise.all([this.validateArtist(data), this.validateCategory(data)]);
    if (!audio) throw new BadRequestException('Audio file is required');
    const media = await this.media(image, audio);
    const saved = await this.trackRepository.save(
      this.trackRepository.create({ ...data, ...media }),
    );
    commitUpload(image);
    commitUpload(audio);
    return saved;
  }

  async update(
    id: string,
    body: unknown,
    image?: Express.Multer.File,
    audio?: Express.Multer.File,
  ) {
    const data = trackFields(body);
    await Promise.all([this.validateArtist(data), this.validateCategory(data)]);
    const track = await this.findOne(id);
    const oldImage = track.image_url;
    const oldAudio = track.audio_url;
    Object.assign(track, data, await this.media(image, audio));
    const saved = await this.trackRepository.save(track);
    commitUpload(image);
    commitUpload(audio);
    if (image) await removeUpload(oldImage);
    if (audio) await removeUpload(oldAudio);
    return saved;
  }

  async delete(id: string) {
    const track = await this.findOne(id);
    await this.trackRepository.remove(track);
    await Promise.all([
      removeUpload(track.image_url),
      removeUpload(track.audio_url),
    ]);
    return { success: true };
  }

  async search(
    keyword: string,
    options: PaginationOptions = paginationOptions(),
  ) {
    if (!keyword?.trim()) return paginated([[], 0], options);
    return paginated(
      await this.trackRepository.findAndCount({
        where: { title: ILike(`%${keyword.trim().slice(0, 100)}%`) },
        relations: ['artists', 'category'],
        order: { created_at: 'DESC' },
        skip: options.skip,
        take: options.limit,
      }),
      options,
    );
  }

  private async validateArtist(data: any) {
    if (
      data.artists?.length &&
      !(await this.artistRepository.findOne({
        where: { id: data.artists[0].id },
      }))
    ) {
      throw new NotFoundException('Artist not found');
    }
  }

  private async validateCategory(data: any) {
    if (
      data.category &&
      !(await this.categoryRepository.findOne({
        where: { id: data.category.id },
      }))
    ) {
      throw new NotFoundException('Category not found');
    }
  }
}
