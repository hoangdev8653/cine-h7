import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany, Index } from 'typeorm';
import { Review } from '../../review/entities/review.entity';

@Entity('movies')
export class Movie {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index('IDX_MOVIE_TITLE')
    @Column({ type: 'varchar', nullable: false })
    title: string;

    @Column({ type: 'varchar', unique: true, nullable: false })
    slug: string;

    @Column({ type: 'varchar', nullable: true })
    trailer: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Index('IDX_MOVIE_RELEASE_DATE')
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

    @Index('IDX_MOVIE_IS_SHOWING')
    @Column({ type: 'boolean', default: true })
    isShowing: boolean;

    @OneToMany(() => Review, review => review.movie)
    reviews: Review[];

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;
}
