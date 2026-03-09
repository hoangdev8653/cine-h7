import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/user.entities';

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id' })
    userId: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    total_amount: number;

    @Column({
        type: 'varchar',
        comment: 'PENDING, PAID, CANCELLED, EXPIRED',
        default: 'PENDING',
    })
    payment_status: string;

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
}
