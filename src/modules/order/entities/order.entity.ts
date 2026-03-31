import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Ticket } from '../../ticket/entities/ticket.entity';

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index('IDX_ORDER_USER_ID')
    @Column({ name: 'user_id' })
    userId: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    total_amount: number;

    @Index('IDX_ORDER_STATUS')
    @Column({
        type: 'varchar',
        comment: 'PENDING, PAID, CANCELLED, EXPIRED',
        default: 'PENDING',
    })
    status: string;

    @Column({
        type: 'varchar',
        comment: 'VNPAY, MOMO, STRIPE',
        nullable: true,
    })
    payment_method: string;

    @Column({ type: 'varchar', nullable: true, comment: 'Mã giao dịch từ cổng thanh toán' })
    transaction_id: string;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column({ type: 'timestamp', nullable: true, comment: 'Thời gian hết hạn giữ ghế' })
    expire_at: Date;

    @Column({ type: 'timestamp', nullable: true })
    paid_at: Date;

    @ManyToOne(() => User, (user) => user.id)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @OneToMany(() => Ticket, (ticket) => ticket.order)
    tickets: Ticket[];
}
