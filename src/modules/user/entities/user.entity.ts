import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
// import { UserStatus } from '../../common/enums/status.enum';
import { Review } from '../../review/entities/review.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Index('IDX_USER_EMAIL')
  @Column()
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: ['ADMIN', 'EMPLOYEE'],
    default: 'EMPLOYEE',
  })
  role: 'ADMIN' | 'EMPLOYEE';

  @Column({
    type: 'enum',
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE',
  })
  status: 'ACTIVE' | 'INACTIVE';

  @Column({
    type: 'enum',
    enum: ['LOCAL', 'GOOGLE'],
    default: 'LOCAL',
  })
  auth_method: 'LOCAL' | 'GOOGLE';

  @Column({ nullable: true })
  avatar: string;

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
