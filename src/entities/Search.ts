import {
    Check,
    Column,
    CreateDateColumn,
    Entity,
    Index,
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

    @Index()
    @Column()
    userId: string;

    /**
     * Latitud of the search
     */
    @Column('numeric')
    @Check("latitude <> 'NaN'")
    latitude: number;

    /**
     * Longitude of the search
     */
    @Column('numeric')
    @Check("longitude <> 'NaN'")
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


    constructor(payload?: { userId: string; latitude: number; longitude: number; city?: string; }) {
        if (payload) {
            this.userId = payload.userId;
            this.latitude = payload.latitude;
            this.longitude = payload.longitude;
            this.city = payload.city || null;
        }
    }
}