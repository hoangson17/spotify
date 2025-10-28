import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Artist } from './artist.entity';
import { Album } from './album.entity';
import { Playlist } from './playlist.entity';
import { User } from './user.entity';

@Entity('tracks')
export class Track {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 100,
  })
  title: string;

  @ManyToOne(() => Album, (album) => album.tracks,{onDelete: 'CASCADE'})
  album: Album;

  @ManyToMany(() => Artist, (artist) => artist.tracks,{onDelete: 'CASCADE'})
  artists: Artist[];

  @ManyToMany(() => Playlist, (playlist) => playlist.tracks,{onDelete: 'CASCADE'})
  playlists: Playlist[];

  @ManyToMany(() => User, (user) => user.tracks,{onDelete: 'CASCADE'})
  users: User[];
 
  @Column({
    type: 'int',
  })
  duration: number;
 
  @Column({
    type: 'text',
    nullable: true,
  })
  image_url: string;

  @Column({
    type: 'text',
  })
  audio_url: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  deleted_at: Date;
}
 