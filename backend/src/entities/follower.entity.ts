import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Artist } from './artist.entity';
 
@Entity('followers')
export class Follower {
  @PrimaryGeneratedColumn()
  id: number;

  // Người theo dõi (luôn là user)
  @ManyToOne(() => User, (user) => user.following, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'follower_id' })
  follower: User;

  // Người bị theo dõi (user hoặc artist)
  @Column({ type: 'int', nullable: false })
  following_id: number;

  @Column({ type: 'varchar', length: 20, nullable: false })
  following_type: 'user' | 'artist';

  // Nếu following là Artist, có thể join để query
  @ManyToOne(() => Artist, { nullable: true })
  @JoinColumn({ name: 'following_id' })
  artist?: Artist;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
 