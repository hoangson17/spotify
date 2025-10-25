import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Track } from './track.entity';
import { Album } from './album.entity';
import { Follower } from './follower.entity';

@Entity('artists')
export class Artist {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 40,
  })
  name: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  bio: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  avatar: string;

  @ManyToMany(() => Track, (track) => track.artists)
  @JoinTable({
    name: 'artist_track',
    joinColumn: {
      name: 'artist_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'track_id',
      referencedColumnName: 'id',
    },
  })
  tracks: Track[];

  @OneToMany(() => Album, (album) => album.artist)
  albums: Album[];

  @OneToMany(() => Follower, (follower) => follower.artist)
  followers: Follower[];

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  country: string;

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

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;
}
