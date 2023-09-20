import { Entity, Column, ManyToOne, OneToMany } from "typeorm"
import { BaseEntity } from "./base.entity.js"
import { BookingSlotEntity } from "./bookingSlot.entity.js"
import { EventAvailability, SelectedDays } from "../events/events.interface.js"
import { UserEntity } from "./user.entity.js"
import { Relation } from "typeorm/index.js"

export interface EventUser {
  id: string // this should be a uuidv4 or uuidv5
  userName?: string
}

@Entity()
export class EventEntity extends BaseEntity {
  //TODO remove nullable options for required fields
  @Column({ type: "varchar", length: 150, nullable: false })
  description: string

  @Column({ type: "varchar", length: 40, nullable: false })
  title: string

  // in which time slots the event is available
  @Column({ type: "jsonb" })
  availabilities: EventAvailability[]

  // on which days the event is available
  @Column({ type: "jsonb" })
  selectedDays: SelectedDays

  // array used to feed UI calendar component
  // @Column({ type: "jsonb", nullable: true })
  // availableDays: any[];

  @Column({ type: "timestamptz", nullable: true })
  fromDate: Date

  @Column({ type: "timestamptz", nullable: true })
  toDate: Date

  @Column({ type: "simple-array" })
  tags?: string[]

  @Column({ type: "json" })
  hourlyRate: any

  @Column({ type: "bytea", nullable: true })
  eventCardImage?: Buffer

  @Column({ type: "boolean" })
  privateEvent: boolean

  @Column({ type: "varchar" })
  eventCardColor: string

  @Column({ type: "varchar" })
  eventTitleColor: string

  @Column({ type: "varchar", nullable: false })
  organizerId: string

  @Column({ type: "varchar", nullable: true })
  organizerAlias: string

  @Column("boolean", { default: true })
  available: boolean

  @Column("boolean", { default: false, nullable: true })
  gCalEventsBooking: boolean

  @ManyToOne(() => UserEntity, (organizer: UserEntity) => organizer.events)
  organizer: Relation<UserEntity>

  // time slots wich are booked by other users
  @OneToMany(
    () => BookingSlotEntity,
    (bookingSlot: BookingSlotEntity) => bookingSlot.event,
    {
      cascade: true,
    }
  )
  bookedSlots: BookingSlotEntity[]
}
