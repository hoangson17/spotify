import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Artist } from 'src/entities/artist.entity';
import { Track } from 'src/entities/track.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ArtistsService {
  constructor(
    @InjectRepository(Artist) private artistRepository: Repository<Artist>,
    @InjectRepository(Track) private trackRepository: Repository<Track>,
  ) {}

  async findAll() {
    return await this.artistRepository.find({
      relations: ['albums', 'tracks'],
    });
  }

  async findOne(id: number) {
    return await this.artistRepository.findOne({
      where: { id },
      relations: ['albums', 'tracks'],
    });
  }

  async create(data: any) {
    return await this.artistRepository.save(data);
  }

  async update(id: number, data: any) {
    await this.artistRepository.update(id, data);
    return this.findOne(id);
  }

  async delete(id: number) {
    return await this.artistRepository.delete(id);
  }

  async createMany(data: Partial<Artist>[]) {
    const artists = this.artistRepository.create(data);
    return await this.artistRepository.save(artists);
  }

async addTracks(artistId: number, trackIds: number[]) {
  const artist = await this.artistRepository.findOne({
    where: { id: artistId },
    relations: ['tracks'],
  });
  if (!artist) throw new NotFoundException('Không tìm thấy ca sĩ');

  const tracks = await this.trackRepository.findByIds(trackIds);
  if (!tracks.length) throw new NotFoundException('Không có bài hát cần tìm');

  const newTracks = tracks.filter(
    (track) => !artist.tracks.some((t) => t.id === track.id),
  );

  artist.tracks.push(...newTracks);

  return await this.artistRepository.save(artist);
}

async syncTracks(artistId: number, trackIds: number[]){
  const artist = await this.artistRepository.findOne({
    where: { id: artistId },
    relations: ['tracks'],
  });

  if (!artist) throw new NotFoundException('Không tìm thấy ca sĩ');

  const tracks = await this.trackRepository.findByIds(trackIds);
  if (!tracks.length){ throw new NotFoundException('Không có bài hát cần tìm');}

  artist.tracks = tracks;
  return await this.artistRepository.save(artist);

}

  async deleteTracks(artistId: number) {
    const artist = await this.artistRepository.findOne({
      where: { id: artistId },
      relations: ['tracks'],
    });
    if (!artist) throw new NotFoundException('Không tìm thấy ca sĩ');

    const dataUpdate = {
      ...artist,
      tracks:[]
    }

    return await this.artistRepository.save(dataUpdate);
  }
}

