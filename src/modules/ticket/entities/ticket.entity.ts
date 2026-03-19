import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Order } from '../../order/entities/order.entity';
import { Showtime } from '../../showtime/entities/showtime.entity';
import { Seat } from '../../seat/entities/seat.entity';

@Entity('tickets')
@Index(['showtimeId', 'seatId'], { unique: true, where: `"status" != 'CANCELLED'` })
export class Ticket {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'order_id' })
    orderId: string;

    @Column({ name: 'showtime_id' })
    showtimeId: string;

    @Column({ name: 'seat_id' })
    seatId: string;

    @Column({ type: 'varchar', nullable: false, comment: 'Snapshot tên ghế tại thời điểm đặt' })
    seat_name: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;

    @Column({
        type: 'varchar',
        comment: 'HELD, BOOKED, CANCELLED',
        default: 'HELD',
    })
    status: string;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @ManyToOne(() => Order, (order) => order.id)
    @JoinColumn({ name: 'order_id' })
    order: Order;

    @ManyToOne(() => Showtime, (showtime) => showtime.id)
    @JoinColumn({ name: 'showtime_id' })
    showtime: Showtime;

    @ManyToOne(() => Seat, (seat) => seat.id)
    @JoinColumn({ name: 'seat_id' })
    seat: Seat;
}
