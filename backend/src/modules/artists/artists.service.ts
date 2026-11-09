import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Artist } from 'src/entities/artist.entity';
import { Track } from 'src/entities/track.entity';
import { artistFields } from 'src/utils/catalog-input';
import { commitUpload, removeUpload } from 'src/utils/uploads';
import { In, Repository } from 'typeorm';
import {
  paginated,
  PaginationOptions,
  paginationOptions,
} from 'src/utils/pagination';

@Injectable()
export class ArtistsService {
  constructor(
    @InjectRepository(Artist) private artistRepository: Repository<Artist>,
    @InjectRepository(Track) private trackRepository: Repository<Track>,
  ) {}

  async findAll(options: PaginationOptions = paginationOptions()) {
    return paginated(
      await this.artistRepository.findAndCount({
        relations: ['albums', 'tracks'],
        order: { name: 'ASC' },
        skip: options.skip,
        take: options.limit,
      }),
      options,
    );
  }

  async findOne(id: string) {
    return await this.artistRepository.findOne({
      where: { id },
      relations: ['albums', 'tracks'],
    });
  }

  async create(data: any, image?: Express.Multer.File) {
    data = artistFields(data, true);
    if (image) {
      if (image.mimetype.startsWith('image/'))
        data.avatar = `/uploads/images/${image.filename}`;
      else throw new Error('Invalid file type');
    }
    const saved = await this.artistRepository.save(data);
    commitUpload(image);
    return saved;
  }

  async update(id: string, data: any, image?: Express.Multer.File) {
    data = artistFields(data);
    const artist = await this.artistRepository.findOne({ where: { id } });
    if (!artist) throw new NotFoundException('Artist not found');
    if (image) {
      if (image.mimetype.startsWith('image/'))
        data.avatar = `/uploads/images/${image.filename}`;
      else throw new Error('Invalid file type');
    }
    await this.artistRepository.update(id, data);
    commitUpload(image);
    if (image) await removeUpload(artist.avatar);
    return this.findOne(id);
  }

  async delete(id: string) {
    return await this.artistRepository.delete(id);
  }

  async createMany(data: Partial<Artist>[]) {
    if (!Array.isArray(data) || data.length > 100)
      throw new BadRequestException('Invalid artist list');
    const artists = this.artistRepository.create(
      data.map((item) => artistFields(item, true)),
    );
    return await this.artistRepository.save(artists);
  }

  async addTracks(artistId: string, trackIds: string[]) {
    const artist = await this.artistRepository.findOne({
      where: { id: artistId },
      relations: ['tracks'],
    });
    if (!artist) throw new NotFoundException('Không tìm thấy ca sĩ');

    const tracks = await this.trackRepository.find({
      where: { id: In(trackIds) },
    });
    if (!tracks.length) throw new NotFoundException('Không có bài hát cần tìm');

    const newTracks = tracks.filter(
      (track) => !artist.tracks.some((t) => t.id === track.id),
    );

    artist.tracks.push(...newTracks);

    return await this.artistRepository.save(artist);
  }

  async syncTracks(artistId: string, trackIds: string[]) {
    const artist = await this.artistRepository.findOne({
      where: { id: artistId },
      relations: ['tracks'],
    });

    if (!artist) throw new NotFoundException('Không tìm thấy ca sĩ');

    const tracks = await this.trackRepository.find({
      where: { id: In(trackIds) },
    });
    if (!tracks.length) {
      throw new NotFoundException('Không có bài hát cần tìm');
    }

    artist.tracks = tracks;
    return await this.artistRepository.save(artist);
  }

  async deleteTracks(artistId: string) {
    const artist = await this.artistRepository.findOne({
      where: { id: artistId },
      relations: ['tracks'],
    });
    if (!artist) throw new NotFoundException('Không tìm thấy ca sĩ');

    const dataUpdate = {
      ...artist,
      tracks: [],
    };

    return await this.artistRepository.save(dataUpdate);
  }
}
