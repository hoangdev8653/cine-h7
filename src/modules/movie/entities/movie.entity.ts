import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('movies')
export class Movie {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', nullable: false })
    title: string;

    @Column({ type: 'varchar', unique: true, nullable: false })
    slug: string;

    @Column({ type: 'varchar', nullable: true })
    trailer: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'timestamp', nullable: true })
    releaseDate: Date;

    @Column({ type: 'int', default: 0 })
    rating: number;

    @Column({ type: 'int', nullable: true })
    duration: number;

    @Column({ type: 'varchar', nullable: true })
    poster: string;

    @Column({ type: 'boolean', default: false })
    comingSoon: boolean;

    @Column({ type: 'boolean', default: true })
    isShowing: boolean;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;
}
