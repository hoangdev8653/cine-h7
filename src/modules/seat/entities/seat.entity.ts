import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Room } from '../../room/entities/room.entity';

@Entity('seats')
export class Seat {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'room_id' })
    roomId: string;

    @Column()
    row: string;

    @Column()
    column: number;

    @Column({ type: 'varchar', default: 'STANDARD' })
    type: string;

    @Column({ default: true })
    isActive: boolean;

    @ManyToOne(() => Room, (room) => room.seats)
    @JoinColumn({ name: 'room_id' })
    room: Room;
}
