import { EventAvailability, SelectedDays } from "src/events/events.interface";
import { Entity, Column, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "./base.entity";
import { BookingSlotEntity } from "./bookingSlot.entity";
import { OrganizerEntity } from "./organizer.entity";

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

  // array used to feed UI calendar component
  // @Column({ type: "jsonb", nullable: true })
  // availableDays: any[];

  @Column({ type: "timestamptz", nullable: true })
  fromDate: Date;

  @Column({ type: "timestamptz", nullable: true })
  toDate: Date;

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

  @Column({ type: "varchar", nullable: false })
  organizerId: string;

  @Column({ type: "varchar", nullable: true })
  organizerAlias: string;

  @Column("boolean", { default: true })
  available: boolean;

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
      cascade: true,
    }
  )
  bookedSlots: BookingSlotEntity[];
}
