import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Artist } from './artist.entity';
import { Album } from './album.entity';
import { Playlist } from './playlist.entity';
import { User } from './user.entity';
import { Category } from './category.entity';

@Entity('tracks')
export class Track {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  title!: string;

  @ManyToOne(() => Album, (album) => album.tracks, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  album!: Album;

  @ManyToOne(() => Category, (category) => category.tracks, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  category?: Category | null;

  @ManyToMany(() => Artist, (artist) => artist.tracks, { onDelete: 'CASCADE' })
  artists!: Artist[];

  @ManyToMany(() => Playlist, (playlist) => playlist.tracks, {
    onDelete: 'CASCADE',
  })
  playlists!: Playlist[];

  @ManyToMany(() => User, (user) => user.tracks, { onDelete: 'CASCADE' })
  users!: User[];

  @Column({
    type: 'int',
  })
  duration!: number;

  @Column({
    type: 'text',
    nullable: true,
  })
  image_url?: string;

  @Column({
    type: 'text',
  })
  audio_url!: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at!: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updated_at!: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  deleted_at?: Date;
}
