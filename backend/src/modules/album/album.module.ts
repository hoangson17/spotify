import { Module } from '@nestjs/common';
import { AlbumService } from './album.service';
import { AlbumController } from './album.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Album } from 'src/entities/album.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [AlbumController],
  providers: [AlbumService],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),TypeOrmModule.forFeature([Album])], 
})
export class AlbumModule {}
