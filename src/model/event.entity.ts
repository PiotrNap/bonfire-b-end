import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class Event {
    @PrimaryGeneratedColumn()
    id: string; // this should be a uuidv4 or uuidv5

    @Column('text')
    description?: string;

    @Column()
    place?: string

    @Column()
    time?: string

    @Column()
    url?: string

    @Column()
    organizer?: string

    @Column()
    attendees?: string

}
export class Organizer {
    @PrimaryGeneratedColumn()
    id: string; // this should be a uuidv4 or uuidv5

    @Column()
    userName?: string;
}

export class Attendee {
    @PrimaryGeneratedColumn()
    id: string; // this should be a uuidv4 or uuidv5

    @Column()
    userName?: string;
<<<<<<< HEAD
}
=======
}
>>>>>>> 4876ce8c00662e1c4b84e8afb367f18a042dc447
