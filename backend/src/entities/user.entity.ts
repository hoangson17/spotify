import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Follower } from './follower.entity';
import { Playlist } from './playlist.entity';
import { Track } from './track.entity';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'varchar',
    length: 30,
  })
  name!: string;

  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
  })
  email!: string;

  @ManyToMany(() => Track, (track) => track.users)
  @JoinTable({
    name: 'liked_tracks',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'track_id',
      referencedColumnName: 'id',
    },
  })
  tracks!: Track[];

  @OneToMany(() => Follower, (follower) => follower.follower)
  following!: Follower[];

  @OneToMany(() => Follower, (follower) => follower.following_id)
  followers!: Follower[];

  @OneToMany(() => Playlist, (playlist) => playlist.users)
  playlists!: Playlist[];

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role!: UserRole;

  @Column({ type: 'simple-json', nullable: true })
  permissions!: string[] | null;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    select: false,
  })
  password?: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  avatar!: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at!: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;
}
