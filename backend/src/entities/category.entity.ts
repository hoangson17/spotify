import {
  Column,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Track } from './track.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
  @Column({ type: 'varchar', length: 100 })
  name!: string;
  @Column({
    type: 'text',
    nullable: true,
  })
  image_url?: string;
  @Column({ type: 'text', nullable: true })
  description?: string;

  @OneToMany(() => Track, (track) => track.category)
  tracks!: Track[];

  @Column({
    type: 'text',
    nullable: true,
  })
  hexHexadecimal?: string;
  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at!: Date;
  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;
}
