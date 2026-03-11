import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { Theater } from '../../theater/entities/theater.entity';

@Entity('theater_systems')
export class TheaterSystem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', nullable: false })
    name: string;

    @Column({ type: 'varchar', nullable: true })
    logo: string;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @OneToMany(() => Theater, (theater) => theater.system)
    theaters: Theater[];
}
