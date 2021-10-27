import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "./base.entity";
import { EventEntity } from "./event.entity";
import { OrganizerEntity } from "./organizer.entity";
import { UserEntity } from "./user.entity";

@Entity()
export class BookingSlotEntity extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("uuid")
  organizerId: string;

  @Column("varchar")
  organizerAlias: string;

  @Column("uuid")
  attendeeId: string;

  @Column("varchar")
  attendeeAlias: string;

  @Column("uuid")
  eventId: string;

  @Column("varchar", { nullable: true })
  eventTitle: string;

  @Column("varchar", { nullable: true })
  eventDescription: string;

  @ManyToOne(() => EventEntity, (event: EventEntity) => event.bookedSlots)
  event: EventEntity;

  @ManyToOne(() => UserEntity, (user: UserEntity) => user.id, { cascade: true })
  attendee: UserEntity;

  @ManyToOne(() => OrganizerEntity, (user: OrganizerEntity) => user.id, {
    cascade: true,
  })
  organizer: OrganizerEntity;

  // duration in milliseconds
  @Column({ type: "int" })
  bookedDuration: number;

  @Column({ type: "timestamptz" })
  bookedDate: Date;

  // transaction hash (?)
  @Column({ type: "varchar", nullable: true })
  txHash: string;
}
