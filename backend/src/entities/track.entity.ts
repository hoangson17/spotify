import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Artist } from './artist.entity';
import { Album } from './album.entity';
import { Playlist } from './playlist.entity';
import { User } from './user.entity';
import { LikedTrack } from './liked_tracks.entity';

@Entity('tracks')
export class Track {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 100,
  })
  title: string;

  @ManyToOne(() => Album, (album) => album.tracks)
  album: Album;

  @ManyToMany(() => Artist, (artist) => artist.tracks)
  artists: Artist[];

  @ManyToMany(() => Playlist, (playlist) => playlist.tracks)
  @JoinTable({
    name: 'playlist_track',
    joinColumn: {
      name: 'track_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'playlist_id',
      referencedColumnName: 'id',
    },
  })
  playlists: Playlist[];

  @ManyToMany(() => User, (user) => user.tracks)
  users: User[];

  @OneToMany(() => LikedTrack, (liked) => liked.track)
  likedBy: LikedTrack[];

  @Column({
    type: 'int',
  })
  duration: number;

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
