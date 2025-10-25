import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Track } from 'src/entities/track.entity';
import { Album } from 'src/entities/album.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TrackService {
  constructor(
    @InjectRepository(Track)
    private trackRepository: Repository<Track>,

    @InjectRepository(Album)
    private albumRepository: Repository<Album>,
  ) {}

  async findAll() {
    return await this.trackRepository.find({
      relations: ['album', 'artists'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number) {
    const track = await this.trackRepository.findOne({
      where: { id },
      relations: ['album', 'artists'],
    });
    if (!track) throw new NotFoundException('Track not found');
    return track;
  }

  async create(data: any) {
    const { albumId, ...trackData } = data;

    const album = await this.albumRepository.findOne({ where: { id: albumId } });
    if (!album) throw new NotFoundException('Album not found');

    const newTrack = this.trackRepository.create({
      ...trackData,
      album, 
    });

    return await this.trackRepository.save(newTrack);
  }

  async update(id: number, data: any) {
    const track = await this.trackRepository.preload({
      id,
      ...data,
    });
    if (!track) throw new NotFoundException('Track not found');

    return await this.trackRepository.save(track);
  }

  async delete(id: number) {
    const track = await this.findOne(id);
    return await this.trackRepository.remove(track);
  }
}
