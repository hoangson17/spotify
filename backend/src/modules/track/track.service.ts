import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Track } from 'src/entities/track.entity';
import { Album } from 'src/entities/album.entity';
import { ILike, Repository } from 'typeorm';
import { join } from 'path';
import * as fs from 'fs';
import mp3Duration from 'mp3-duration';


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
    if (!image.mimetype.startsWith('image/')) throw new Error('Invalid file type');
    data.image = `/uploads/images/${image.filename}`;
  }

  if (audio) {
    if (!audio.mimetype.startsWith('audio/')) throw new Error('Invalid file type');
    data.audio = `/uploads/audio/${audio.filename}`;

    // Lấy duration
    const audioPath = join(process.cwd(), 'uploads', 'audio', audio.filename);
    const duration = await new Promise<number>((resolve, reject) => {
      mp3Duration(audioPath, (err, duration) => {
        if (err) reject(err);
        else resolve(duration);
      });
    });
    data.duration = duration; // lưu duration vào db
  }

  const newTrack = this.trackRepository.create({
    ...data,
    image_url: data.image,
    audio_url: data.audio,
    duration: data.duration, // thêm trường duration
  });

  return await this.trackRepository.save(newTrack);
}

async update(
  id: number,
  data: any,
  image?: Express.Multer.File,
  audio?: Express.Multer.File,
) {
  const track = await this.trackRepository.findOne({ where: { id } });
  if (!track) throw new NotFoundException('Track not found');

  if (image) {
    if (!image.mimetype.startsWith('image/')) throw new Error('Invalid file type image');
    // xóa file cũ
    if (track.image_url) {
      const oldPath = join(process.cwd(), track.image_url.replace('/uploads/', 'uploads/'));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    data.image = `/uploads/images/${image.filename}`;
  }

  if (audio) {
    if (!audio.mimetype.startsWith('audio/')) throw new Error('Invalid file type audio');
    // xóa file cũ
    if (track.audio_url) {
      const oldPath = join(process.cwd(), track.audio_url.replace('/uploads/', 'uploads/'));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    data.audio = `/uploads/audio/${audio.filename}`;

    // lấy duration mới
    const audioPath = join(process.cwd(), 'uploads', 'audio', audio.filename);
    const duration = await new Promise<number>((resolve, reject) => {
      mp3Duration(audioPath, (err, duration) => {
        if (err) reject(err);
        else resolve(duration);
      });
    });
    data.duration = duration;
  }

  const updatedTrack = {
    ...track,
    ...data,
    image_url: data.image,
    audio_url: data.audio,
    duration: data.duration,
  };

  return await this.trackRepository.save(updatedTrack);
}

  async delete(id: number) {
    const track = await this.findOne(id);
    return await this.trackRepository.remove(track);
  }


  async search(keyword: string) {
    if (!keyword || keyword.trim() === '') return [];
    return this.trackRepository.find({
      where: { title: ILike(`%${keyword}%`) },
      // relations: ['artist'],
      // take: 20, //số lượng bản ghi
    });
  }
}
