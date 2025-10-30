import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { join } from 'path';
import { Playlist } from 'src/entities/playlist.entity';
import { Track } from 'src/entities/track.entity';
import { User } from 'src/entities/user.entity';
import { In, Repository } from 'typeorm';
import * as fs from 'fs';

@Injectable()
export class PlaylistService {
    constructor(
        @InjectRepository(Playlist) private playlistRepository: Repository<Playlist>,
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(Track) private trackRepository: Repository<Track>,
    ) {}

    async findAll(){
        return this.playlistRepository.find({relations: ['tracks','users']});
    }

    async findOne(id: number){
        return this.playlistRepository.findOne({where: {id}, relations: ['tracks','users']});
    }

    async create(data: any, image?: Express.Multer.File){
        const {user_id} = data;
        const user = await this.userRepository.findOne({where: {id: user_id}});        
        if (!user) throw new NotFoundException('User not found');        
        if(image){
            if(image.mimetype.startsWith('image/')) data.cover_image = `http://localhost:3000/uploads/images/${image.filename}`
            else throw new Error('Invalid file type');
        }        
        data.users = {...user};
        return this.playlistRepository.save(data);
    }

    async update(id: number, data: any, image?: Express.Multer.File){
        const {user_Id} = data;
        const user = await this.playlistRepository.findOne({where: {id: user_Id}});
        if (!user) throw new NotFoundException('User not found');
        const playlist = await this.playlistRepository.findOne({where: {id}});
        if (!playlist) throw new NotFoundException('Playlist not found');
        if(image){
            if(playlist.cover_image){
                try{
                    const oldFileName = playlist.cover_image.split('/uploads/')[1];
                    const oldFilePath = join(process.cwd(), `uploads`, oldFileName);
                    if(fs.existsSync(oldFilePath)){
                        fs.unlinkSync(oldFilePath);
                        console.log('file deleted', oldFilePath);
                    }
                }catch(err){
                    console.warn("loi xoa anh cu", err);
                }
            }
            if(image.mimetype.startsWith('image/')) data.cover_image = `http://localhost:3000/uploads/images/${image.filename}`
            else throw new Error('Invalid file type');
        }
        const playlistUpdate = {...playlist, ...data};
        await this.playlistRepository.update(id, playlistUpdate);
        return playlistUpdate;
    }

    async delete(id: number){
        return this.playlistRepository.delete(id);
    }

    async syncTrack(id:number, TrackIds:number[]){
        const playlist = await this.playlistRepository.findOne({where: {id}, relations: ['tracks']});
        if(!playlist) throw new NotFoundException('Playlist not found');
        const tracks = await this.trackRepository.find({where: {id: In(TrackIds)}})
        if(!tracks.length) throw new NotFoundException('No tracks found');
        playlist.tracks = tracks;
        return this.playlistRepository.save(playlist);
    }

    async addTrack(id:number,TrackIds:number[]){
        const playlist = await this.playlistRepository.findOne({where: {id}, relations: ['tracks']});
        if(!playlist) throw new NotFoundException('Playlist not found');
        const tracks = await this.trackRepository.find({where: {id: In(TrackIds)}})
        if(!tracks.length) throw new NotFoundException('No tracks found');
        playlist.tracks.push(...tracks);
        return this.playlistRepository.save(playlist);
    }

    async deleteTracks(id:number){
        const playlist = await this.playlistRepository.findOne({where: {id}, relations: ['tracks']});
        if(!playlist) throw new NotFoundException('Playlist not found');
        playlist.tracks = [];
        return this.playlistRepository.save(playlist);
    }
}
