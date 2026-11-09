import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Track } from 'src/entities/track.entity';
import { Album } from 'src/entities/album.entity';
import { Artist } from 'src/entities/artist.entity';
import { CacheService } from 'src/cache/cache.service';
import {
  paginated,
  PaginationOptions,
  paginationOptions,
} from 'src/utils/pagination';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Track)
    private trackRepo: Repository<Track>,

    @InjectRepository(Album)
    private albumRepo: Repository<Album>,

    @InjectRepository(Artist)
    private artistRepo: Repository<Artist>,
    private readonly cache: CacheService,
  ) {}

  async searchAll(
    query: string,
    options: PaginationOptions = paginationOptions(),
  ) {
    const normalized = query.trim().replace(/\s+/g, ' ').toLocaleLowerCase();
    const cacheKey = `${normalized}:${options.page}:${options.limit}`;
    return this.cache.remember('search', cacheKey, async () => {
      const [tracks, albums, artists] = await Promise.all([
        this.trackRepo
          .createQueryBuilder('track')
          .leftJoinAndSelect('track.artists', 'artist')
          .leftJoinAndSelect('track.album', 'album')
          .where('track.title LIKE :q', { q: `%${normalized}%` })
          .orderBy('track.created_at', 'DESC')
          .skip(options.skip)
          .take(options.limit)
          .getManyAndCount(),

        this.albumRepo
          .createQueryBuilder('album')
          .leftJoinAndSelect('album.artist', 'artist')
          .where('album.title LIKE :q', { q: `%${normalized}%` })
          .orderBy('album.created_at', 'DESC')
          .skip(options.skip)
          .take(options.limit)
          .getManyAndCount(),

        this.artistRepo
          .createQueryBuilder('artist')
          .where('artist.name LIKE :q', { q: `%${normalized}%` })
          .orderBy('artist.name', 'ASC')
          .skip(options.skip)
          .take(options.limit)
          .getManyAndCount(),
      ]);

      return {
        tracks: paginated(tracks, options),
        albums: paginated(albums, options),
        artists: paginated(artists, options),
      };
    });
  }
}
