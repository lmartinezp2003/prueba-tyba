import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './User';


@Entity()
export class Search {
    /**
     * Primary key of the review
     */
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /**
     * Latitud of the search
     */
    @Column()
    latitude: number;

    /**
     * Longitude of the search
     */
    @Column()
    longitude: number;

    /**
     * City of the search
     */
    @Column({nullable: true})
    city: string;

    /**
     * Date of creation of the review in the database
     */
    @CreateDateColumn()
    createdAt: Date;

    /**
     * User who made the search
     */
    @ManyToOne(() => User, (user) => user.searches)
    @JoinColumn({ name: 'user_id' })
    user: User;


    constructor(payload?: { latitud: number; longitude: number; city: string; }) {
        if (payload) {
            this.latitude = payload.latitud;
            this.longitude = payload.longitude;
            this.city = payload.city;
        }
    }
}