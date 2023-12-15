import { Entity, Column, ManyToOne, OneToMany } from "typeorm"
import { BaseEntity } from "./base.entity.js"
import { BookingSlotEntity } from "./bookingSlot.entity.js"
import { Cancellation, EventAvailability } from "../events/events.interface.js"
import { UserEntity } from "./user.entity.js"
import { Relation } from "typeorm/index.js"

export interface EventUser {
  id: string // this should be a uuidv4 or uuidv5
  userName?: string
}

export type EventVisibility = "private" | "public"

@Entity()
export class EventEntity extends BaseEntity {
  @Column({ type: "varchar", length: 150 })
  description: string

  @Column({ type: "varchar", length: 40 })
  title: string

  // array of objects representing open time slots and their booking slots
  @Column({ type: "jsonb" })
  availabilities: EventAvailability[]

  @Column({ type: "jsonb" })
  cancellation: Cancellation

  // whether this event is fully booked or not
  @Column({ type: "boolean" })
  isAvailable: boolean

  @Column({ type: "timestamptz" })
  fromDate: Date

  @Column({ type: "timestamptz" })
  toDate: Date

  // payment tokens in JSON schema format
  @Column({ type: "json" })
  hourlyRate: any

  @Column("varchar", { nullable: true })
  note: string

  // this has to be nullable because the image is updated right after new event creation
  @Column({ type: "bytea", nullable: true })
  eventCardImage?: Buffer

  @Column({ type: "varchar" })
  visibility: EventVisibility

  @Column({ type: "varchar" })
  eventCardColor: string

  @Column({ type: "varchar" })
  eventTitleColor: string

  @Column({ type: "varchar" })
  organizerId: string

  @Column({ type: "varchar" })
  organizerAddress: string

  @Column({ type: "varchar" })
  organizerAlias: string

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
