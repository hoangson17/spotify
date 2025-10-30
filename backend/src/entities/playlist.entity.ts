import { Delete } from '@nestjs/common';
import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Track } from './track.entity';
import { User } from './user.entity';
 
@Entity('playlists')
export class Playlist {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.playlists, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  users: number[];
 
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
  @JoinTable({
    name: 'playlist_track',
    joinColumn: {
      name: 'playlist_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'track_id',
      referencedColumnName: 'id',
    },
  }) 
  tracks: Track[];

  @Column({
    type: 'tinyint',
    default: 1,
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
 