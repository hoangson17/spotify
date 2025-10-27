import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Track } from 'src/entities/track.entity';
import { User } from 'src/entities/user.entity';
import { In, Not, Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Track) private trackRepository: Repository<Track>,
  ) {}

  async update(id: number, data: any) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    const userUpdate = { ...user, ...data };
    await this.userRepository.update(id, userUpdate);
    return userUpdate;
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

    return await this.userRepository.save(user);
  }

  async deleteTracks(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['tracks'],
    });
    if (!user) throw new NotFoundException('User not found');

    const dataUpdate = {
      ...user,
      tracks: [],
    };

    return await this.userRepository.save(dataUpdate);
  }
}
