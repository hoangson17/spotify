import { Delete } from "@nestjs/common";
import { Column, DeleteDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        type: 'varchar',
        length: 30
    })
    name: string

    @Column({
        type: 'varchar',
        length: 100,
        unique: true
    })
    email: string

    @Column({
        type: 'varchar',
        length: 100,
        nullable: true
    })
    password: string

    @Column({
        type: 'text',
        nullable: true
    })
    avatar: string

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP'
    })
    created_at: string

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP'
    })
    updated_at: string
     
    @DeleteDateColumn({ nullable: true })
    deletedAt?: Date;
}