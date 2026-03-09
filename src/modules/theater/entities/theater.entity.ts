import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { TheaterSystem } from '../../theater-system/entities/theater-system.entity';

@Entity('theaters')
export class Theater {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'system_id' })
    systemId: number;

    @Column({ type: 'varchar', nullable: false })
    name: string;

    @Column({ type: 'varchar', nullable: true })
    address: string;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @ManyToOne(() => TheaterSystem, (system) => system.theaters)
    @JoinColumn({ name: 'system_id' })
    system: TheaterSystem;
}
