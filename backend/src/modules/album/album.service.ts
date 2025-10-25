import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Album } from 'src/entities/album.entity';
import { In, Repository } from 'typeorm';

@Injectable()
export class AlbumService {
    constructor(@InjectRepository(Album) private albumRepository: Repository<Album>) {}

    findAll(){
        return this.albumRepository.find({relations: ['artist', 'tracks']});
    }

    findOne(id: number){
        return this.albumRepository.findOne({where: {id}, relations: ['artist', 'tracks']});
    }

    create(data: any){
        return this.albumRepository.save(data);
    }

    update(id: number, data: any){
        return this.albumRepository.update(id, data);
    }

    delete(id: number){
        return this.albumRepository.delete(id);
    }
}
