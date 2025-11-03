import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Track } from 'src/entities/track.entity';
import { Album } from 'src/entities/album.entity';
import { Artist } from 'src/entities/artist.entity';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Track)
    private trackRepo: Repository<Track>,

    @InjectRepository(Album)
    private albumRepo: Repository<Album>,

    @InjectRepository(Artist)
    private artistRepo: Repository<Artist>,
  ) {}

  async searchAll(query: string) {
    const [tracks, albums, artists] = await Promise.all([
      this.trackRepo
        .createQueryBuilder('track')
        .leftJoinAndSelect('track.artists', 'artist')
        .leftJoinAndSelect('track.album', 'album')
        .where('track.title LIKE :q', { q: `%${query}%` })
        .getMany(),

      this.albumRepo
        .createQueryBuilder('album')
        .leftJoinAndSelect('album.artist', 'artist')
        .where('album.title LIKE :q', { q: `%${query}%` })
        .getMany(),

      this.artistRepo
        .createQueryBuilder('artist')
        .where('artist.name LIKE :q', { q: `%${query}%` })
        .getMany(),
    ]);

    return { tracks, albums, artists };
  }
}
