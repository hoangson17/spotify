import { Entity, ManyToOne, JoinColumn, CreateDateColumn, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';
import { Track } from './track.entity';

@Entity('liked_tracks')
export class LikedTrack {
  @PrimaryColumn()
  user_id: number;

  @PrimaryColumn()
  track_id: number;

  @ManyToOne(() => User, (user) => user.likedTracks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Track, (track) => track.likedBy, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'track_id' })
  track: Track;

  @CreateDateColumn()
  liked_at: Date;
}
