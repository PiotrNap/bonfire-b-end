import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { Relation } from "typeorm/index.js"
import { BaseEntity } from "./base.entity.js"
import { EventEntity } from "./event.entity.js"
import { UserEntity } from "./user.entity.js"
import { Cancellation } from "src/events/events.interface.js"
import { NetworkId } from "src/utils/types.js"

@Entity()
export class BookingSlotEntity extends BaseEntity {
  @Column("varchar")
  status: "reserved" | "booked"

  @Column('real')
  reservedAt: number

  @Column("uuid")
  organizerId: string

  @Column("varchar")
  networkId: NetworkId

  @Column("varchar")
  organizerAlias: string

  @Column("uuid")
  attendeeId: string

  @Column("varchar")
  attendeeAlias: string

  @Column("uuid")
  eventId: string

  @Column("varchar")
  eventTitle: string

  @Column("varchar", { nullable: true })
  eventDescription: string

  @Column("real")
  duration: number

  // payment tokens in JSON schema format
  @Column("json")
  cost: string

  @ManyToOne(() => EventEntity, (event: EventEntity) => event.bookedSlots)
  event: EventEntity

  @ManyToOne(() => UserEntity, (user: UserEntity) => user.id, { cascade: true })
  attendee: Relation<UserEntity>

  @ManyToOne(() => UserEntity, (user: UserEntity) => user.id, {
    cascade: true,
  })
  organizer: Relation<UserEntity>

  @Column({ type: "timestamptz" })
  fromDate: string

  @Column({ type: "timestamptz" })
  toDate: string

  @Column({ type: "varchar", nullable: true })
  unlockingTxHash: string

  @Column({ type: "varchar", nullable: true })
  lockingTxHash: string

  @Column({ type: "jsonb", nullable: true })
  cancellation: Cancellation

  @Column({ type: "varchar", nullable: true })
  datumHash: string
}
