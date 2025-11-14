import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { join } from 'path';
import { Track } from 'src/entities/track.entity';
import { User } from 'src/entities/user.entity';
import { In, Not, Repository } from 'typeorm';
import * as fs from 'fs';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Track) private trackRepository: Repository<Track>,
  ) {}

  async update(id: number, data: any, file?: Express.Multer.File) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    
    if (file) {
      if(user.avatar){
        try{
          const oldFileName = user.avatar.split('/uploads/')[1];
          const oldFilePath = join(process.cwd(), `uploads`, oldFileName);
          if(fs.existsSync(oldFilePath)){
            fs.unlinkSync(oldFilePath);
            console.log('file deleted', oldFilePath);
          }
        }catch(err){
          console.warn("lỗi xóa ảnh cũ", err);
        }
      }
      if (file.mimetype.startsWith('image/')) data.avatar = `/uploads/images/${file.filename}`;
      else throw new Error('Invalid file type');
      // else if (file.mimetype === 'audio/mpeg') data.audio = `http://localhost:3000/uploads/audio/${file.filename}`;
    }
    await this.userRepository.update(id, data);
    return { ...user, ...data };
  }

  async syncTrack(userId: number, trackIds: number[]) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['tracks'],
    });
    if (!user) throw new NotFoundException('User not found');

    const tracks = await this.trackRepository.find({
      where: { id: In(trackIds) },
    });
    //   const tracks = await this.trackRepository.findByIds(trackIds);

    if (!tracks.length) throw new NotFoundException('No tracks found');
    user.tracks = tracks;

    return await this.userRepository.save(user);
  }

  async addTracks(userId: number, trackIds: number[]) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['tracks'],
    });
    if (!user) throw new NotFoundException('User not found');

    const tracks = await this.trackRepository.find({
      where: { id: In(trackIds) },
    });
    //   const tracks = await this.trackRepository.findByIds(trackIds);

    if (!tracks.length) throw new NotFoundException('No tracks found');

    const newTracks = tracks.filter(
      (track) => !user.tracks.some((t) => t.id === track.id),
    );

    user.tracks.push(...newTracks);

    const savedUser = await this.userRepository.save(user);

    return {
      ...savedUser,
      password: null,
    };

  }

async deleteTracks(userId: number, trackIds: number[]) {
  const user = await this.userRepository.findOne({
    where: { id: userId },
    relations: ['tracks'],
  });

  if (!user) throw new NotFoundException('User not found');

  const updatedTracks = user.tracks.filter(
    (track) => !trackIds.includes(track.id)
  );

  const dataUpdate = {
    ...user,
    tracks: updatedTracks,
  };

  return await this.userRepository.save(dataUpdate);
}



  async getTracks(userId: number) {
    const result = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['tracks'],
    })
    delete (result as any).password;
    return result;
  }
}
