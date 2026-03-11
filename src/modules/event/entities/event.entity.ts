import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('events')
export class Event {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', comment: 'PROMOTION, NEWS' })
    type: string;

    @Column({ type: 'varchar', nullable: false })
    title: string;

    @Column({ type: 'varchar', unique: true, comment: 'Đường dẫn thân thiện cho SEO' })
    slug: string;

    @Column({ type: 'varchar', nullable: true, comment: 'Lưu link ảnh từ trường files' })
    thumbnail: string;

    @Column({ type: 'json', nullable: true, comment: 'Chứa summary, sections, tags, location...' })
    content: any;

    @Column({ type: 'boolean', default: true })
    is_active: boolean;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;
}
