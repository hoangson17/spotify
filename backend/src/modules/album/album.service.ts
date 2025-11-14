import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { join } from 'path';
import { Album } from 'src/entities/album.entity';
import { In, Repository } from 'typeorm';
import * as fs from 'fs';

@Injectable()
export class AlbumService {
    constructor(@InjectRepository(Album) private albumRepository: Repository<Album>) {}

    findAll(){
        return this.albumRepository.find({relations: ['artist', 'tracks']});
    }

    findOne(id: number){
        return this.albumRepository.findOne({where: {id}, relations: ['artist', 'tracks']});
    }

    create(data: any,file?: Express.Multer.File){
        if(file){
            if(file.mimetype.startsWith('image/')) data.cover_image = `/uploads/images/${file.filename}`
            else throw new Error('Invalid file type');
        }
        return this.albumRepository.save(data);
    }

    async update(id: number, data: any,file?: Express.Multer.File){
        const album = await this.albumRepository.findOne({where: {id}});
        if(!album) throw new NotFoundException('Album not found');
        if(file){
            if(album.cover_image){
                try{
                    const oldFileName = album.cover_image.split('/uploads/')[1];
                    const oldFilePath = join(process.cwd(), `uploads`, oldFileName);
                    if(fs.existsSync(oldFilePath)){
                        fs.unlinkSync(oldFilePath);
                        console.log('file deleted', oldFilePath);
                    }
                }catch(err){
                    console.warn("loi xoa anh cu", err);
                }
            }
            if(file.mimetype.startsWith('image/')) data.cover_image = `/uploads/images/${file.filename}`
            else throw new Error('Invalid file type');
        }
        this.albumRepository.update(id, data);
        return this.findOne(id); 
    }

    delete(id: number){
        return this.albumRepository.delete(id);
    }
}
