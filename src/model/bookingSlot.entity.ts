import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { Relation } from "typeorm/index.js"
import { BaseEntity } from "./base.entity.js"
import { EventEntity } from "./event.entity.js"
import { UserEntity } from "./user.entity.js"

@Entity()
export class BookingSlotEntity extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column("uuid")
  organizerId: string

  @Column("varchar")
  organizerAlias: string

  @Column("uuid")
  attendeeId: string

  @Column("varchar")
  attendeeAlias: string

  @Column("uuid")
  eventId: string

  @Column("varchar", { nullable: true })
  eventTitle: string

  @Column("varchar", { nullable: true })
  eventDescription: string

  @Column("real", { nullable: true })
  durationCost: number | null

  @ManyToOne(() => EventEntity, (event: EventEntity) => event.bookedSlots)
  event: EventEntity

  @ManyToOne(() => UserEntity, (user: UserEntity) => user.id, { cascade: true })
  attendee: Relation<UserEntity>

  @ManyToOne(() => UserEntity, (user: UserEntity) => user.id, {
    cascade: true,
  })
  organizer: Relation<UserEntity>

  // duration in milliseconds
  @Column({ type: "int" })
  bookedDuration: number

  @Column({ type: "timestamptz" })
  bookedDate: Date

  // transaction hash (?)
  @Column({ type: "varchar", nullable: true })
  txHash: string
}
