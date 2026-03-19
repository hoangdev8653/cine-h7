import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
// import { UserStatus } from '../../common/enums/status.enum';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

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

    // @Column({
    //     type: 'enum',
    //     enum: UserStatus,
    //     default: UserStatus.ACTIVE,
    // })
    // status: UserStatus;

    @Column({
        type: 'enum',
        enum: ["ACTIVE", "INACTIVE"],
        default: "ACTIVE",
    })
    status: "ACTIVE" | "INACTIVE";

    @Column({
        type: 'enum',
        enum: ['LOCAL', 'GOOGLE'],
        default: 'LOCAL',
    })
    auth_method: 'LOCAL' | 'GOOGLE';

    @Column({ nullable: true })
    avatar: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}