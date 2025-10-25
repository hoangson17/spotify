import { Delete } from '@nestjs/common';
import {
  Column,
  DeleteDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Track } from './track.entity';

@Entity('playlists')
export class Playlist {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'int',
  })
  user_id: number;

  @Column({
    type: 'varchar',
    length: 100,
  })
  title: string;

  @Column({
    type: 'text',
  })
  description: string;

  @Column({
    type: 'text',
  })
  cover_image: string;

  @ManyToMany(() => Track, (track) => track.playlists)
  tracks: Track[];

  @Column({
    type: 'tinyint',
  })
  is_public: number;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP', 
  })
  created_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
