import { Chance } from 'chance';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Search } from './Search';

/**
 * Enum of the available roles for a user
 */
export enum UserRoles {
    ADMIN = 'admin',
    USER = 'user',
}

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /**
     * username of the user
     */
    @Column({ length: 50, nullable: true, unique: true })
    username?: string;

    /**
     * email of the user
     */
    @Column({ length: 50, unique: true })
    email: string;

    /**
     * hashed password
     */
    @Column({ length: 100 })
    password: string;

    /**
     * role of the user
     */
    @Column({ type: 'enum', enum: UserRoles })
    role: UserRoles;

    /**
     * Date of creation of the user
     */
    @CreateDateColumn()
    createdAt: Date;

    /**
     * Searches of the user
     */
    @OneToMany(() => Search, (search) => search.user)
    searches: Search[];

    constructor(payload?: { username?: string | null; email: string; password: string; role: UserRoles }) {
        if (payload) {
            this.id = new Chance().guid();
            this.email = payload.email;
            this.username = payload.username ?? undefined;
            this.password = payload.password;
            this.role = payload.role;
        }
    }
}