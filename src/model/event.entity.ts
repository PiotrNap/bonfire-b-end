import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class Event {
    @PrimaryGeneratedColumn()
    id: string; // this should be a uuidv4 or uuidv5

    @Column('text')
    description: string;

    @Column()
    place: any

    @Column()
    time: any

    @Column()
    url: any

    @Column()
    organizer: any

    @Column()
    attendees: []

}
export class Organizer {
    @PrimaryGeneratedColumn()
    id: string; // this should be a uuidv4 or uuidv5

    @Column()
    userName: string;
}

export class Attendee {
    @PrimaryGeneratedColumn()
    id: string; // this should be a uuidv4 or uuidv5

    @Column()
    userName: string;
}