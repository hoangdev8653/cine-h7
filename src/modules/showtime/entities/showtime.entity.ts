import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Movie } from '../../movie/entities/movie.entity';
import { Room } from '../../room/entities/room.entity';

@Entity('showtimes')
export class Showtime {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index('IDX_SHOWTIME_MOVIE_ID')
    @Column({ name: 'movie_id' })
    movieId: string;

    @Column({ name: 'room_id' })
    roomId: string;

    @Index('IDX_SHOWTIME_START_TIME')
    @Column({ type: 'timestamp', nullable: false })
    startTime: Date;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    price: number;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @ManyToOne(() => Movie, (movie) => movie.id)
    @JoinColumn({ name: 'movie_id' })
    movie: Movie;

    @ManyToOne(() => Room, (room) => room.id)
    @JoinColumn({ name: 'room_id' })
    room: Room;
}
