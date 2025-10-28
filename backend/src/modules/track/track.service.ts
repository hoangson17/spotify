import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Track } from 'src/entities/track.entity';
import { Album } from 'src/entities/album.entity';
import { Repository } from 'typeorm';
import { join } from 'path';
import * as fs from 'fs';

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

  async create(
    data: any,
    image?: Express.Multer.File,
    audio?: Express.Multer.File,
  ) {
    if (image) {
      if (image.mimetype.startsWith('image/'))
        data.image = `http://localhost:3000/uploads/images/${image.filename}`;
      else throw new Error('Invalid file type');
    }
    if (audio) {
      if (audio.mimetype.startsWith('audio/'))
        data.audio = `http://localhost:3000/uploads/audio/${audio.filename}`;
      else throw new Error('Invalid file type');
    }
    const newTrack = this.trackRepository.create({
      ...data,
      image_url: data.image,
      audio_url: data.audio,
    });

    return await this.trackRepository.save(newTrack);

    // const { albumId, ...trackData } = data;
    // const album = await this.albumRepository.findOne({ where: { id: albumId } });
    // if (!album) throw new NotFoundException('Album not found');
    // const newTrack = this.trackRepository.create({
    //   ...trackData,
    //   album,
    // })
    // return await this.trackRepository.save(newTrack);
  }

  async update(
    id: number,
    data: any,
    image?: Express.Multer.File,
    audio?: Express.Multer.File,
  ) {
    const track = await this.trackRepository.findOne({
      where: { id },
      relations: ['album', 'artists'],
    });
    if (!track) throw new NotFoundException('Track not found');

    if (image) {
      if (track.image_url) {
        try {
          const oldFileName = track.image_url.split('/uploads/')[1];
          const oldFilePath = join(process.cwd(), `uploads`, oldFileName);
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
            console.log('file deleted', oldFilePath);
          }
        } catch (err) {
          console.warn('lỗi xóa ảnh cũ', err);
        }
      }
      if (image.mimetype.startsWith('image/'))
        data.image = `http://localhost:3000/uploads/images/${image.filename}`;
      else throw new Error('Invalid file type image');
    }
    if (audio) {
      if (track.audio_url) {
        try {
          const oldFileName = track.audio_url.split('/uploads/')[1];
          const oldFilePath = join(process.cwd(), `uploads`, oldFileName);
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
            console.log('file deleted', oldFilePath);
          }
        } catch (err) {
          console.warn('lỗi xóa nhạc cũ', err);
        }
      }
      if (audio.mimetype.startsWith('audio/'))
        data.audio = `http://localhost:3000/uploads/audio/${audio.filename}`;
      else throw new Error('Invalid file type audio');
    }
    const updatedTrack = {
      ...track,
      ...data,
      image_url: data.image,
      audio_url: data.audio,
    };
    return await this.trackRepository.save(updatedTrack);
    // if (data.albumId) {
    //   const album = await this.albumRepository.findOne({
    //     where: { id: data.albumId },
    //   });
    //   if (!album) throw new NotFoundException('Album not found');
    //   data.album = album;
    // }
    // const track = await this.trackRepository.preload({
    //   id,
    //   ...data,
    // });
    // if (!track) throw new NotFoundException('Track not found');

    // return await this.trackRepository.save(track);
  }

  async delete(id: number) {
    const track = await this.findOne(id);
    return await this.trackRepository.remove(track);
  }
}
