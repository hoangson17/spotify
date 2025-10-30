import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { join } from 'path';
import { Artist } from 'src/entities/artist.entity';
import { Track } from 'src/entities/track.entity';
import { Repository } from 'typeorm';
import * as fs from 'fs';

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

  async create(data: any, image?: Express.Multer.File) {
    if(image){ 
      if(image.mimetype.startsWith('image/')) data.avatar = `http://localhost:3000/uploads/images/${image.filename}`
      else throw new Error('Invalid file type');
    }
    return await this.artistRepository.save(data);
  }

  async update(id: number, data: any, image?: Express.Multer.File) {
    const artist = await this.artistRepository.findOne({ where: { id } });
    if (!artist) throw new NotFoundException('Artist not found');
    if(image){
      if(artist.avatar){
        try{
          const oldFileName = artist.avatar.split('/uploads/')[1];
          const oldFilePath = join(process.cwd(), `uploads`, oldFileName);
          if(fs.existsSync(oldFilePath)){
            fs.unlinkSync(oldFilePath);
            console.log('file deleted', oldFilePath);
          }
        }catch(err){
          console.warn("lỗi xóa ảnh cũ", err);
        }
      }
      if(image.mimetype.startsWith('image/')) data.avatar = `http://localhost:3000/uploads/images/${image.filename}`
      else throw new Error('Invalid file type');
    }
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

