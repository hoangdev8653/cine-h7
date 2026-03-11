import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Theater } from '../../theater/entities/theater.entity';
import { Seat } from '../../seat/entities/seat.entity';

@Entity('rooms')
export class Room {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'theater_id' })
    theaterId: string;

    @Column({ type: 'varchar', nullable: false })
    name: string;

    @Column({ type: 'varchar', comment: '2D, 3D, IMAX, GOLD CLASS', default: '2D' })
    type: string;

    @Column({ type: 'int', default: 100 })
    total_seats: number;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @ManyToOne(() => Theater, (theater) => theater.id)
    @JoinColumn({ name: 'theater_id' })
    theater: Theater;

    @OneToMany(() => Seat, (seat) => seat.room)
    seats: Seat[];
}
