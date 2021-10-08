import { EventAvailability, SelectedDays } from "src/events/events.interface";
import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { BaseEntity } from "./base.entity";
import { BookingSlotEntity } from "./bookingSlot.entity";
import { OrganizerEntity } from "./organizer.entity";
import { UserEntity } from "./user.entity";

export interface EventUser {
  id: string; // this should be a uuidv4 or uuidv5
  userName?: string;
}

@Entity()
export class EventEntity extends BaseEntity {
  @Column({ type: "varchar", length: 150, nullable: false })
  description: string;

  @Column({ type: "varchar", length: 40, nullable: false })
  title: string;

  // in which time slots the event is available
  @Column({ type: "jsonb" })
  availabilities: EventAvailability[];

  // on which days the event is available
  @Column({ type: "jsonb" })
  selectedDays: SelectedDays;

  @Column({ type: "simple-array" })
  tags?: string[];

  @Column({ type: "int" })
  hourlyRate: number;

  @Column({ type: "varchar" })
  imageURI: string;

  @Column({ type: "boolean" })
  privateEvent: boolean;

  @Column({ type: "varchar" })
  eventCardColor: string;

  @Column({ type: "varchar" })
  eventTitleColor: string;

  @Column("int", { nullable: true })
  organizerId: string;

  @ManyToOne(
    () => OrganizerEntity,
    (organizer: OrganizerEntity) => organizer.events
  )
  organizer: OrganizerEntity;

  // time slots wich are booked by other users
  @OneToMany(
    () => BookingSlotEntity,
    (bookingSlot: BookingSlotEntity) => bookingSlot.event,
    {
      // this will cascade changes to booked slot
      cascade: true,
    }
  )
  bookedSlots: BookingSlotEntity[];
}
